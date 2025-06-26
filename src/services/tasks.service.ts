import { CreateTaskRequest, Task, UpdateTaskRequest } from "../types/task.type";

/**
 * @fileoverview Service de communication avec l'API Express pour la gestion des tâches
 * @description Service centralisé pour toutes les interactions HTTP avec l'API backend.
 * Gère la sérialisation/désérialisation des données et la gestion d'erreurs robuste.
 * @author Christopher Marie-Angélique
 * @version 1.0.0
 * @since 2024
 */

/**
 * Interface pour les réponses d'erreur de l'API
 * @interface ApiErrorResponse
 */
interface ApiErrorResponse {
  error: string;
  code?: string;
  timestamp?: string;
}

/**
 * Interface pour les erreurs de validation
 * @interface ValidationErrorResponse
 */
interface ValidationErrorResponse {
  errors: Array<{
    type: string;
    msg: string;
    path: string;
    value: string | number | boolean | null | undefined;
  }>;
}

/**
 * Classe d'erreur personnalisée pour les erreurs API
 * @class ApiError
 * @extends Error
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
    public validationErrors?: ValidationErrorResponse["errors"]
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * Service pour gérer toutes les communications avec l'API Express
 * @class TasksService
 * @description Service centralisé pour les opérations CRUD sur les tâches.
 * Conforme aux spécifications de l'API backend validée par les tests unitaires.
 */
export class TasksService {
  /**
   * URL de base de l'API Express
   * @private
   * @readonly
   */
  private readonly API_BASE_URL = "http://localhost:3001/api";

  /**
   * Headers par défaut pour toutes les requêtes
   * @private
   * @readonly
   */
  private readonly DEFAULT_HEADERS = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  /**
   * Timeout par défaut pour les requêtes (10 secondes)
   * @private
   * @readonly
   */
  private readonly REQUEST_TIMEOUT = 10000;

  /**
   * Méthode utilitaire pour effectuer des requêtes HTTP avec gestion d'erreurs
   * @private
   * @param {string} endpoint - Endpoint relatif à l'API
   * @param {RequestInit} options - Options de la requête fetch
   * @returns {Promise<T>} Réponse désérialisée
   * @throws {ApiError} Erreur API avec détails
   */
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.API_BASE_URL}${endpoint}`;

    // Configuration de la requête avec timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(
      () => controller.abort(),
      this.REQUEST_TIMEOUT
    );

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...this.DEFAULT_HEADERS,
          ...options.headers,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Gestion des erreurs HTTP
      if (!response.ok) {
        await this.handleHttpError(response);
      }

      // Gestion des réponses vides (DELETE)
      if (
        response.status === 204 ||
        response.headers.get("content-length") === "0"
      ) {
        return {} as T;
      }

      // Parsing JSON avec gestion d'erreurs
      try {
        return await response.json();
      } catch (parseError) {
        throw new ApiError(
          `Erreur de parsing de la réponse JSON: ${
            parseError instanceof Error ? parseError.message : "Format invalide"
          }`,
          response.status,
          "PARSE_ERROR"
        );
      }
    } catch (error) {
      clearTimeout(timeoutId);

      // Gestion des erreurs d'annulation (timeout)
      if (error instanceof Error && error.name === "AbortError") {
        throw new ApiError(
          "Timeout de la requête - Serveur inaccessible",
          408,
          "REQUEST_TIMEOUT"
        );
      }

      // Gestion des erreurs réseau
      if (error instanceof Error && error.message.includes("fetch")) {
        throw new ApiError(
          "Erreur réseau - Vérifiez que le serveur Express est démarré",
          0,
          "NETWORK_ERROR"
        );
      }

      // Re-throw des ApiError
      if (error instanceof ApiError) {
        throw error;
      }

      // Erreurs inconnues
      throw new ApiError(
        error instanceof Error ? error.message : "Erreur inconnue",
        500,
        "UNKNOWN_ERROR"
      );
    }
  }

  /**
   * Gère les erreurs HTTP en fonction du statut
   * @private
   * @param {Response} response - Réponse HTTP
   * @throws {ApiError} Erreur typée selon le statut
   */
  private async handleHttpError(response: Response): Promise<never> {
    let errorData: ApiErrorResponse | ValidationErrorResponse;

    try {
      errorData = await response.json();
    } catch {
      // Fallback si le parsing JSON échoue
      errorData = { error: response.statusText || "Erreur serveur" };
    }

    // Gestion des erreurs de validation (400)
    if (response.status === 400 && "errors" in errorData) {
      throw new ApiError(
        "Données de requête invalides",
        400,
        "VALIDATION_ERROR",
        errorData.errors
      );
    }

    // Gestion des erreurs API standard
    if ("error" in errorData) {
      throw new ApiError(
        errorData.error,
        response.status,
        errorData.code || `HTTP_${response.status}`
      );
    }

    // Fallback pour erreurs sans format attendu
    throw new ApiError(
      `Erreur HTTP ${response.status}`,
      response.status,
      `HTTP_${response.status}`
    );
  }

  /**
   * Récupère toutes les tâches stockées
   * @description Effectue une requête GET vers l'endpoint /tasks pour récupérer
   * la liste complète des tâches. Conforme aux spécifications testées.
   * @async
   * @returns {Promise<Task[]>} Tableau des tâches (vide si aucune tâche)
   * @throws {ApiError} Erreur de communication ou serveur (500)
   * @example
   * ```typescript
   * try {
   *   const tasks = await tasksService.getAllTasks();
   *   console.log(`${tasks.length} tâches récupérées`);
   * } catch (error) {
   *   if (error instanceof ApiError) {
   *     console.error(`Erreur API: ${error.message}`);
   *   }
   * }
   * ```
   */
  async getAllTasks(): Promise<Task[]> {
    return this.makeRequest<Task[]>("/tasks", {
      method: "GET",
    });
  }

  /**
   * Crée une nouvelle tâche
   * @description Effectue une requête POST vers l'endpoint /tasks avec validation
   * automatique côté serveur. L'ID est généré automatiquement par le backend.
   * @async
   * @param {CreateTaskRequest} task - Données de la tâche à créer
   * @param {string} task.title - Titre de la tâche (1-200 caractères)
   * @param {boolean} task.completed - État initial de completion
   * @returns {Promise<Task>} Tâche créée avec ID généré
   * @throws {ApiError} Erreur de validation (400) ou serveur (500)
   * @example
   * ```typescript
   * try {
   *   const newTask = await tasksService.createTask({
   *     title: "Apprendre TypeScript",
   *     completed: false
   *   });
   *   console.log(`Tâche créée avec l'ID: ${newTask.id}`);
   * } catch (error) {
   *   if (error instanceof ApiError && error.validationErrors) {
   *     error.validationErrors.forEach(err => {
   *       console.error(`${err.path}: ${err.msg}`);
   *     });
   *   }
   * }
   * ```
   */
  async createTask(task: CreateTaskRequest): Promise<Task> {
    return this.makeRequest<Task>("/tasks", {
      method: "POST",
      body: JSON.stringify(task),
    });
  }

  /**
   * Met à jour une tâche existante
   * @description Effectue une requête PUT vers l'endpoint /tasks/:id avec support
   * de mise à jour partielle. Seuls les champs fournis sont modifiés.
   * @async
   * @param {number} id - ID de la tâche à mettre à jour
   * @param {UpdateTaskRequest} updates - Champs à modifier
   * @param {string} [updates.title] - Nouveau titre (optionnel)
   * @param {boolean} [updates.completed] - Nouvel état (optionnel)
   * @returns {Promise<Task>} Tâche mise à jour
   * @throws {ApiError} Tâche non trouvée (404), validation (400) ou serveur (500)
   * @example
   * ```typescript
   * try {
   *   // Mise à jour partielle (titre seulement)
   *   const updatedTask = await tasksService.updateTask(1, {
   *     title: "Titre modifié"
   *   });
   *
   *   // Mise à jour du statut seulement
   *   await tasksService.updateTask(1, {
   *     completed: true
   *   });
   * } catch (error) {
   *   if (error instanceof ApiError && error.status === 404) {
   *     console.error("Tâche non trouvée");
   *   }
   * }
   * ```
   */
  async updateTask(id: number, updates: UpdateTaskRequest): Promise<Task> {
    return this.makeRequest<Task>(`/tasks/${id}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    });
  }

  /**
   * Supprime définitivement une tâche
   * @description Effectue une requête DELETE vers l'endpoint /tasks/:id.
   * La suppression est irréversible et confirme le succès via le message.
   * @async
   * @param {number} id - ID de la tâche à supprimer
   * @returns {Promise<void>} Promise résolue si suppression réussie
   * @throws {ApiError} Tâche non trouvée (404) ou erreur serveur (500)
   * @example
   * ```typescript
   * try {
   *   await tasksService.deleteTask(1);
   *   console.log("Tâche supprimée avec succès");
   * } catch (error) {
   *   if (error instanceof ApiError) {
   *     if (error.status === 404) {
   *       console.error("Tâche déjà supprimée ou inexistante");
   *     } else {
   *       console.error(`Erreur de suppression: ${error.message}`);
   *     }
   *   }
   * }
   * ```
   */
  async deleteTask(id: number): Promise<void> {
    // Le backend retourne { message: "Task deleted successfully" }
    // mais on l'ignore car l'interface promet void
    await this.makeRequest<{ message: string }>(`/tasks/${id}`, {
      method: "DELETE",
    });
  }

  /**
   * Méthode utilitaire pour vérifier la connectivité avec l'API
   * @description Effectue un health check basique en tentant de récupérer les tâches.
   * Utile pour diagnostiquer les problèmes de connexion.
   * @async
   * @returns {Promise<boolean>} true si l'API est accessible
   * @example
   * ```typescript
   * const isApiOnline = await tasksService.checkApiHealth();
   * if (!isApiOnline) {
   *   console.warn("API Express indisponible");
   * }
   * ```
   */
  async checkApiHealth(): Promise<boolean> {
    try {
      await this.getAllTasks();
      return true;
    } catch (error) {
      console.warn(
        "API Health Check Failed:",
        error instanceof ApiError ? error.message : error
      );
      return false;
    }
  }
}

/**
 * Instance singleton du service pour utilisation dans l'application
 * @type {TasksService}
 * @example
 * ```typescript
 * import { tasksService } from '@/services/tasks.service';
 *
 * const tasks = await tasksService.getAllTasks();
 * ```
 */
export const tasksService = new TasksService();

/**
 * Export par défaut de la classe pour flexibilité d'import
 */
export default TasksService;
