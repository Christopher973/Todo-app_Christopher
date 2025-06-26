import { useCallback, useState } from "react";
import { ApiError, tasksService } from "../services/tasks.service";
import { Task } from "../types/task.type";

/**
 * @fileoverview Hook pour la suppression de tâches avec confirmation
 * @description Hook de mutation qui gère la suppression de tâches avec
 * confirmation utilisateur, optimistic updates et possibilité de restoration.
 * @author Christopher Marie-Angélique
 * @version 1.0.0
 * @since 2024
 */

/**
 * Interface pour les callbacks du hook useDeleteTask
 * @interface DeleteTaskCallbacks
 */
interface DeleteTaskCallbacks {
  /** Callback appelé après suppression réussie */
  onSuccess?: (taskId: number) => void;
  /** Callback appelé en cas d'erreur */
  onError?: (error: ApiError) => void;
  /** Callback pour invalider le cache des tâches */
  onInvalidateCache?: () => void;
  /** Callback pour suppression optimiste */
  onOptimisticDelete?: (taskId: number) => void;
  /** Callback pour restoration en cas d'erreur */
  onRestore?: (taskId: number) => void;
  /** Callback pour confirmation utilisateur */
  onConfirm?: (task: Task) => Promise<boolean>;
}

/**
 * Interface pour l'état retourné par le hook useDeleteTask
 * @interface UseDeleteTaskReturn
 */
interface UseDeleteTaskReturn {
  /** Fonction pour supprimer une tâche avec confirmation */
  deleteTask: (task: Task) => Promise<boolean>;
  /** Fonction pour supprimer sans confirmation (pour usage interne) */
  deleteTaskWithoutConfirm: (taskId: number) => Promise<boolean>;
  /** État de suppression en cours par ID de tâche */
  isDeleting: Record<number, boolean>;
  /** Erreurs de suppression par ID de tâche */
  errors: Record<number, ApiError>;
  /** Fonction pour réinitialiser l'erreur d'une tâche */
  clearError: (id: number) => void;
  /** Tâches en attente de confirmation */
  pendingConfirmation: Record<number, Task>;
  /** Fonction pour annuler une confirmation en cours */
  cancelConfirmation: (id: number) => void;
}

/**
 * Fonction de confirmation par défaut
 * @private
 * @param {Task} task - Tâche à supprimer
 * @returns {Promise<boolean>} true si confirmé
 */
const defaultConfirmation = async (task: Task): Promise<boolean> => {
  return window.confirm(
    `Êtes-vous sûr de vouloir supprimer la tâche "${task.title}" ?\n\nCette action est irréversible.`
  );
};

/**
 * Hook pour la suppression de tâches
 * @description Hook de mutation qui encapsule la logique de suppression de tâches
 * avec confirmation utilisateur, optimistic updates et gestion complète des erreurs.
 * @param {DeleteTaskCallbacks} callbacks - Callbacks optionnels pour les événements
 * @returns {UseDeleteTaskReturn} État et fonctions de suppression
 * @example
 * ```typescript
 * function TaskItem({ task }) {
 *   const { invalidateCache } = useTasks();
 *   const {
 *     deleteTask,
 *     isDeleting,
 *     errors,
 *     clearError,
 *     pendingConfirmation,
 *     cancelConfirmation
 *   } = useDeleteTask({
 *     onSuccess: (taskId) => {
 *       toast.success('Tâche supprimée avec succès');
 *     },
 *     onError: (error) => {
 *       toast.error(`Erreur: ${error.message}`);
 *     },
 *     onInvalidateCache: invalidateCache,
 *     onConfirm: async (task) => {
 *       return await showCustomConfirmDialog(
 *         `Supprimer "${task.title}" ?`,
 *         'Cette action est irréversible.'
 *       );
 *     }
 *   });
 *
 *   const handleDelete = async () => {
 *     const deleted = await deleteTask(task);
 *     if (deleted) {
 *       // Tâche supprimée avec succès
 *     }
 *   };
 *
 *   return (
 *     <div>
 *       {errors[task.id] && (
 *         <ErrorMessage error={errors[task.id]} onDismiss={() => clearError(task.id)} />
 *       )}
 *       {pendingConfirmation[task.id] && (
 *         <ConfirmDialog
 *           task={task}
 *           onCancel={() => cancelConfirmation(task.id)}
 *         />
 *       )}
 *       <button
 *         onClick={handleDelete}
 *         disabled={isDeleting[task.id]}
 *       >
 *         {isDeleting[task.id] ? 'Suppression...' : 'Supprimer'}
 *       </button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useDeleteTask(
  callbacks: DeleteTaskCallbacks = {}
): UseDeleteTaskReturn {
  // États locaux du hook
  const [isDeleting, setIsDeleting] = useState<Record<number, boolean>>({});
  const [errors, setErrors] = useState<Record<number, ApiError>>({});
  const [pendingConfirmation, setPendingConfirmation] = useState<
    Record<number, Task>
  >({});

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
   * Fonction pour annuler une confirmation en cours
   * @public
   * @param {number} id - ID de la tâche
   */
  const cancelConfirmation = useCallback((id: number) => {
    setPendingConfirmation((prev) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [id]: _, ...rest } = prev;
      return rest;
    });
  }, []);

  /**
   * Fonction utilitaire pour mettre à jour l'état de suppression
   * @private
   * @param {number} id - ID de la tâche
   * @param {boolean} deleting - État de suppression
   */
  const setTaskDeleting = useCallback((id: number, deleting: boolean) => {
    setIsDeleting((prev) => ({
      ...prev,
      [id]: deleting,
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
   * Fonction de suppression sans confirmation (usage interne)
   * @public
   * @async
   * @param {number} taskId - ID de la tâche à supprimer
   * @returns {Promise<boolean>} true si suppression réussie
   */
  const deleteTaskWithoutConfirm = useCallback(
    async (taskId: number): Promise<boolean> => {
      try {
        setTaskDeleting(taskId, true);
        clearError(taskId);

        // Optimistic delete
        callbacks.onOptimisticDelete?.(taskId);

        // Appel API pour supprimer la tâche
        await tasksService.deleteTask(taskId);

        // Invalidation du cache des tâches
        callbacks.onInvalidateCache?.();

        // Callback de succès
        callbacks.onSuccess?.(taskId);

        return true;
      } catch (err) {
        console.error("Erreur lors de la suppression de la tâche:", err);

        let apiError: ApiError;

        if (err instanceof ApiError) {
          apiError = err;
        } else {
          apiError = new ApiError(
            "Erreur inattendue lors de la suppression",
            500,
            "UNKNOWN_ERROR"
          );
        }

        // Restoration de l'optimistic delete
        callbacks.onRestore?.(taskId);

        // Mise à jour de l'état d'erreur
        setTaskError(taskId, apiError);

        // Callback d'erreur
        callbacks.onError?.(apiError);

        return false;
      } finally {
        setTaskDeleting(taskId, false);
      }
    },
    [callbacks, clearError, setTaskDeleting, setTaskError]
  );

  /**
   * Fonction principale de suppression avec confirmation
   * @public
   * @async
   * @param {Task} task - Tâche à supprimer
   * @returns {Promise<boolean>} true si suppression réussie
   */
  const deleteTask = useCallback(
    async (task: Task): Promise<boolean> => {
      // Vérification des données d'entrée
      if (!task || typeof task.id !== "number") {
        const validationError = new ApiError(
          "Tâche invalide pour la suppression",
          400,
          "VALIDATION_ERROR"
        );
        setTaskError(task?.id || 0, validationError);
        callbacks.onError?.(validationError);
        return false;
      }

      try {
        // Ajouter la tâche aux confirmations en attente
        setPendingConfirmation((prev) => ({
          ...prev,
          [task.id]: task,
        }));

        // Demander confirmation à l'utilisateur
        const confirmFunction = callbacks.onConfirm || defaultConfirmation;
        const confirmed = await confirmFunction(task);

        // Retirer de la liste des confirmations en attente
        cancelConfirmation(task.id);

        if (!confirmed) {
          return false;
        }

        // Procéder à la suppression
        return await deleteTaskWithoutConfirm(task.id);
      } catch (err) {
        console.error("Erreur lors de la confirmation de suppression:", err);

        // Retirer de la liste des confirmations en attente
        cancelConfirmation(task.id);

        const confirmError = new ApiError(
          "Erreur lors de la confirmation de suppression",
          500,
          "CONFIRMATION_ERROR"
        );
        setTaskError(task.id, confirmError);
        callbacks.onError?.(confirmError);

        return false;
      }
    },
    [callbacks, cancelConfirmation, deleteTaskWithoutConfirm, setTaskError]
  );

  return {
    deleteTask,
    deleteTaskWithoutConfirm,
    isDeleting,
    errors,
    clearError,
    pendingConfirmation,
    cancelConfirmation,
  };
}

/**
 * Export par défaut du hook
 */
export default useDeleteTask;
