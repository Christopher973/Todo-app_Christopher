import { useCallback, useState } from "react";
import { ApiError, tasksService } from "../services/tasks.service";
import { CreateTaskRequest, Task } from "../types/task.type";

/**
 * @fileoverview Hook pour la création de tâches avec optimistic updates
 * @description Hook de mutation qui gère la création de nouvelles tâches avec
 * mise à jour optimiste de l'interface et gestion complète des erreurs.
 * @author Christopher Marie-Angélique
 * @version 1.0.0
 * @since 2024
 */

/**
 * Interface pour les callbacks du hook useCreateTask
 * @interface CreateTaskCallbacks
 */
interface CreateTaskCallbacks {
  /** Callback appelé après création réussie */
  onSuccess?: (task: Task) => void;
  /** Callback appelé en cas d'erreur */
  onError?: (error: ApiError) => void;
  /** Callback pour invalider le cache des tâches */
  onInvalidateCache?: () => void;
}

/**
 * Interface pour l'état retourné par le hook useCreateTask
 * @interface UseCreateTaskReturn
 */
interface UseCreateTaskReturn {
  /** Fonction pour créer une nouvelle tâche */
  createTask: (taskData: CreateTaskRequest) => Promise<Task | null>;
  /** État de soumission en cours */
  isSubmitting: boolean;
  /** Erreur de création */
  error: ApiError | null;
  /** Fonction pour réinitialiser l'état d'erreur */
  clearError: () => void;
  /** Dernière tâche créée avec succès */
  lastCreatedTask: Task | null;
}

/**
 * Hook pour la création de tâches
 * @description Hook de mutation qui encapsule la logique de création de tâches
 * avec gestion d'état, optimistic updates et callbacks configurables.
 * @param {CreateTaskCallbacks} callbacks - Callbacks optionnels pour les événements
 * @returns {UseCreateTaskReturn} État et fonctions de création
 * @example
 * ```typescript
 * function TaskForm() {
 *   const { tasks, invalidateCache } = useTasks();
 *   const { createTask, isSubmitting, error, clearError } = useCreateTask({
 *     onSuccess: (task) => {
 *       toast.success(`Tâche "${task.title}" créée avec succès`);
 *     },
 *     onError: (error) => {
 *       toast.error(`Erreur: ${error.message}`);
 *     },
 *     onInvalidateCache: invalidateCache
 *   });
 *
 *   const handleSubmit = async (formData) => {
 *     const newTask = await createTask({
 *       title: formData.title,
 *       completed: false
 *     });
 *     if (newTask) {
 *       resetForm();
 *     }
 *   };
 *
 *   return (
 *     <form onSubmit={handleSubmit}>
 *       {error && <ErrorAlert error={error} onDismiss={clearError} />}
 *       <button disabled={isSubmitting}>
 *         {isSubmitting ? 'Création...' : 'Créer la tâche'}
 *       </button>
 *     </form>
 *   );
 * }
 * ```
 */
export function useCreateTask(
  callbacks: CreateTaskCallbacks = {}
): UseCreateTaskReturn {
  // États locaux du hook
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [lastCreatedTask, setLastCreatedTask] = useState<Task | null>(null);

  /**
   * Fonction pour réinitialiser l'état d'erreur
   * @public
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Fonction principale de création de tâche
   * @public
   * @async
   * @param {CreateTaskRequest} taskData - Données de la tâche à créer
   * @returns {Promise<Task | null>} Tâche créée ou null en cas d'erreur
   */
  const createTask = useCallback(
    async (taskData: CreateTaskRequest): Promise<Task | null> => {
      // Validation des données d'entrée
      if (!taskData.title || taskData.title.trim().length === 0) {
        const validationError = new ApiError(
          "Le titre de la tâche est requis",
          400,
          "VALIDATION_ERROR"
        );
        setError(validationError);
        callbacks.onError?.(validationError);
        return null;
      }

      if (taskData.title.length > 200) {
        const validationError = new ApiError(
          "Le titre ne peut pas dépasser 200 caractères",
          400,
          "VALIDATION_ERROR"
        );
        setError(validationError);
        callbacks.onError?.(validationError);
        return null;
      }

      try {
        setIsSubmitting(true);
        setError(null);

        // Nettoyage des données d'entrée
        const cleanTaskData: CreateTaskRequest = {
          title: taskData.title.trim(),
          completed: Boolean(taskData.completed),
        };

        // Appel API pour créer la tâche
        const newTask = await tasksService.createTask(cleanTaskData);

        // Mise à jour de l'état local
        setLastCreatedTask(newTask);

        // Invalidation du cache des tâches
        callbacks.onInvalidateCache?.();

        // Callback de succès
        callbacks.onSuccess?.(newTask);

        return newTask;
      } catch (err) {
        console.error("Erreur lors de la création de la tâche:", err);

        let apiError: ApiError;

        if (err instanceof ApiError) {
          apiError = err;
        } else {
          apiError = new ApiError(
            "Erreur inattendue lors de la création",
            500,
            "UNKNOWN_ERROR"
          );
        }

        // Mise à jour de l'état d'erreur
        setError(apiError);

        // Callback d'erreur
        callbacks.onError?.(apiError);

        return null;
      } finally {
        setIsSubmitting(false);
      }
    },
    [callbacks]
  );

  return {
    createTask,
    isSubmitting,
    error,
    clearError,
    lastCreatedTask,
  };
}

/**
 * Export par défaut du hook
 */
export default useCreateTask;
