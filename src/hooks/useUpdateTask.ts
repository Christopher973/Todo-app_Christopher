import { useCallback, useState } from "react";
import { ApiError, tasksService } from "../services/tasks.service";
import { Task, UpdateTaskRequest } from "../types/task.type";

/**
 * @fileoverview Hook pour la mise à jour de tâches avec optimistic updates
 * @description Hook de mutation qui gère les mises à jour de tâches existantes
 * avec support des modifications partielles et optimistic updates.
 * @author Christopher Marie-Angélique
 * @version 1.0.0
 * @since 2024
 */

/**
 * Interface pour les callbacks du hook useUpdateTask
 * @interface UpdateTaskCallbacks
 */
interface UpdateTaskCallbacks {
  /** Callback appelé après mise à jour réussie */
  onSuccess?: (task: Task) => void;
  /** Callback appelé en cas d'erreur */
  onError?: (error: ApiError) => void;
  /** Callback pour invalider le cache des tâches */
  onInvalidateCache?: () => void;
  /** Callback pour mise à jour optimiste */
  onOptimisticUpdate?: (id: number, updates: UpdateTaskRequest) => void;
  /** Callback pour rollback en cas d'erreur */
  onRollback?: (id: number) => void;
}

/**
 * Interface pour l'état retourné par le hook useUpdateTask
 * @interface UseUpdateTaskReturn
 */
interface UseUpdateTaskReturn {
  /** Fonction pour mettre à jour une tâche */
  updateTask: (id: number, updates: UpdateTaskRequest) => Promise<Task | null>;
  /** Fonction rapide pour toggle le statut completed */
  toggleTaskCompletion: (
    id: number,
    currentCompleted: boolean
  ) => Promise<Task | null>;
  /** État de soumission en cours par ID de tâche */
  isUpdating: Record<number, boolean>;
  /** Erreurs de mise à jour par ID de tâche */
  errors: Record<number, ApiError>;
  /** Fonction pour réinitialiser l'erreur d'une tâche */
  clearError: (id: number) => void;
  /** Fonction pour réinitialiser toutes les erreurs */
  clearAllErrors: () => void;
}

/**
 * Hook pour la mise à jour de tâches
 * @description Hook de mutation qui encapsule la logique de mise à jour de tâches
 * avec optimistic updates, gestion des états par tâche et rollback automatique.
 * @param {UpdateTaskCallbacks} callbacks - Callbacks optionnels pour les événements
 * @returns {UseUpdateTaskReturn} État et fonctions de mise à jour
 * @example
 * ```typescript
 * function TaskItem({ task }) {
 *   const { invalidateCache } = useTasks();
 *   const {
 *     updateTask,
 *     toggleTaskCompletion,
 *     isUpdating,
 *     errors,
 *     clearError
 *   } = useUpdateTask({
 *     onSuccess: (task) => {
 *       toast.success(`Tâche mise à jour`);
 *     },
 *     onError: (error) => {
 *       toast.error(`Erreur: ${error.message}`);
 *     },
 *     onInvalidateCache: invalidateCache
 *   });
 *
 *   const handleToggle = () => {
 *     toggleTaskCompletion(task.id, task.completed);
 *   };
 *
 *   const handleEdit = async (newTitle: string) => {
 *     await updateTask(task.id, { title: newTitle });
 *   };
 *
 *   return (
 *     <div>
 *       {errors[task.id] && (
 *         <ErrorMessage error={errors[task.id]} onDismiss={() => clearError(task.id)} />
 *       )}
 *       <button
 *         onClick={handleToggle}
 *         disabled={isUpdating[task.id]}
 *       >
 *         {isUpdating[task.id] ? 'Mise à jour...' : 'Toggle'}
 *       </button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useUpdateTask(
  callbacks: UpdateTaskCallbacks = {}
): UseUpdateTaskReturn {
  // États locaux du hook
  const [isUpdating, setIsUpdating] = useState<Record<number, boolean>>({});
  const [errors, setErrors] = useState<Record<number, ApiError>>({});

  /**
   * Fonction pour réinitialiser l'erreur d'une tâche spécifique
   * @public
   * @param {number} id - ID de la tâche
   */
  const clearError = useCallback((id: number) => {
    setErrors((prev) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [id]: _, ...rest } = prev;
      return rest;
    });
  }, []);

  /**
   * Fonction pour réinitialiser toutes les erreurs
   * @public
   */
  const clearAllErrors = useCallback(() => {
    setErrors({});
  }, []);

  /**
   * Fonction utilitaire pour mettre à jour l'état de chargement
   * @private
   * @param {number} id - ID de la tâche
   * @param {boolean} loading - État de chargement
   */
  const setTaskLoading = useCallback((id: number, loading: boolean) => {
    setIsUpdating((prev) => ({
      ...prev,
      [id]: loading,
    }));
  }, []);

  /**
   * Fonction utilitaire pour définir une erreur pour une tâche
   * @private
   * @param {number} id - ID de la tâche
   * @param {ApiError} error - Erreur à définir
   */
  const setTaskError = useCallback((id: number, error: ApiError) => {
    setErrors((prev) => ({
      ...prev,
      [id]: error,
    }));
  }, []);

  /**
   * Fonction principale de mise à jour de tâche
   * @public
   * @async
   * @param {number} id - ID de la tâche à mettre à jour
   * @param {UpdateTaskRequest} updates - Modifications à apporter
   * @returns {Promise<Task | null>} Tâche mise à jour ou null en cas d'erreur
   */
  const updateTask = useCallback(
    async (id: number, updates: UpdateTaskRequest): Promise<Task | null> => {
      // Validation des données d'entrée
      if (updates.title !== undefined) {
        if (
          typeof updates.title !== "string" ||
          updates.title.trim().length === 0
        ) {
          const validationError = new ApiError(
            "Le titre ne peut pas être vide",
            400,
            "VALIDATION_ERROR"
          );
          setTaskError(id, validationError);
          callbacks.onError?.(validationError);
          return null;
        }

        if (updates.title.length > 200) {
          const validationError = new ApiError(
            "Le titre ne peut pas dépasser 200 caractères",
            400,
            "VALIDATION_ERROR"
          );
          setTaskError(id, validationError);
          callbacks.onError?.(validationError);
          return null;
        }
      }

      try {
        setTaskLoading(id, true);
        clearError(id);

        // Nettoyage des données d'entrée
        const cleanUpdates: UpdateTaskRequest = {};
        if (updates.title !== undefined) {
          cleanUpdates.title = updates.title.trim();
        }
        if (updates.completed !== undefined) {
          cleanUpdates.completed = Boolean(updates.completed);
        }

        // Optimistic update
        callbacks.onOptimisticUpdate?.(id, cleanUpdates);

        // Appel API pour mettre à jour la tâche
        const updatedTask = await tasksService.updateTask(id, cleanUpdates);

        // Invalidation du cache des tâches
        callbacks.onInvalidateCache?.();

        // Callback de succès
        callbacks.onSuccess?.(updatedTask);

        return updatedTask;
      } catch (err) {
        console.error("Erreur lors de la mise à jour de la tâche:", err);

        let apiError: ApiError;

        if (err instanceof ApiError) {
          apiError = err;
        } else {
          apiError = new ApiError(
            "Erreur inattendue lors de la mise à jour",
            500,
            "UNKNOWN_ERROR"
          );
        }

        // Rollback de l'optimistic update
        callbacks.onRollback?.(id);

        // Mise à jour de l'état d'erreur
        setTaskError(id, apiError);

        // Callback d'erreur
        callbacks.onError?.(apiError);

        return null;
      } finally {
        setTaskLoading(id, false);
      }
    },
    [callbacks, clearError, setTaskError, setTaskLoading]
  );

  /**
   * Fonction rapide pour toggle le statut completed d'une tâche
   * @public
   * @async
   * @param {number} id - ID de la tâche
   * @param {boolean} currentCompleted - État actuel de completion
   * @returns {Promise<Task | null>} Tâche mise à jour ou null en cas d'erreur
   */
  const toggleTaskCompletion = useCallback(
    async (id: number, currentCompleted: boolean): Promise<Task | null> => {
      return updateTask(id, { completed: !currentCompleted });
    },
    [updateTask]
  );

  return {
    updateTask,
    toggleTaskCompletion,
    isUpdating,
    errors,
    clearError,
    clearAllErrors,
  };
}

/**
 * Export par défaut du hook
 */
export default useUpdateTask;
