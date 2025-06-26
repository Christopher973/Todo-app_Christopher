/**
 * @fileoverview Export centralisé des hooks personnalisés pour la gestion des tâches
 * @description Point d'entrée unique pour importer tous les hooks de gestion des tâches.
 * Facilite l'import et maintient une API cohérente pour les composants.
 * @author Christopher Marie-Angélique
 * @version 1.0.0
 * @since 2024
 */

import useCreateTask from "./useCreateTask";
import useDeleteTask from "./useDeleteTask";
import useTasks from "./useTasks";
import useUpdateTask from "./useUpdateTask";

// Export des hooks avec leurs types depuis les bons fichiers
export { useCreateTask } from "./useCreateTask";
export { useDeleteTask } from "./useDeleteTask";
export { useTasks } from "./useTasks";
export { useUpdateTask } from "./useUpdateTask";

// Export par défaut des hooks principaux pour faciliter l'import
export { useTasks as default, useTasks as useTasksHook } from "./useTasks";

/**
 * Hook composite qui combine tous les hooks de gestion des tâches
 * @description Hook de convenance qui encapsule tous les hooks de tâches
 * avec une configuration par défaut et des callbacks pré-configurés.
 * @returns {Object} Tous les hooks configurés ensemble
 * @example
 * ```typescript
 * import { useTasksManager } from '@/hooks';
 *
 * function TasksPage() {
 *   const {
 *     // État des tâches
 *     tasks,
 *     loading,
 *     error,
 *     refetch,
 *
 *     // Création
 *     createTask,
 *     isCreating,
 *
 *     // Mise à jour
 *     updateTask,
 *     toggleTask,
 *     isUpdating,
 *
 *     // Suppression
 *     deleteTask,
 *     isDeleting,
 *
 *     // Utilitaires
 *     clearAllErrors,
 *     hasErrors
 *   } = useTasksManager();
 *
 *   return (
 *     <div>
 *       <TaskForm onSubmit={createTask} loading={isCreating} />
 *       <TaskList
 *         tasks={tasks}
 *         onUpdate={updateTask}
 *         onToggle={toggleTask}
 *         onDelete={deleteTask}
 *         loading={loading}
 *       />
 *     </div>
 *   );
 * }
 * ```
 */
export function useTasksManager() {
  // Hook principal pour l'état des tâches
  const tasksHook = useTasks();

  // Hook de création avec callbacks configurés
  const createHook = useCreateTask({
    onSuccess: (task) => {
      console.log(`Tâche "${task.title}" créée avec succès`);
    },
    onInvalidateCache: tasksHook.invalidateCache,
  });

  // Hook de mise à jour avec callbacks configurés
  const updateHook = useUpdateTask({
    onSuccess: (task) => {
      console.log(`Tâche "${task.title}" mise à jour`);
    },
    onInvalidateCache: tasksHook.invalidateCache,
  });

  // Hook de suppression avec callbacks configurés
  const deleteHook = useDeleteTask({
    onSuccess: (taskId) => {
      console.log(`Tâche ${taskId} supprimée avec succès`);
    },
    onInvalidateCache: tasksHook.invalidateCache,
  });

  /**
   * Fonction utilitaire pour réinitialiser toutes les erreurs
   */
  const clearAllErrors = () => {
    updateHook.clearAllErrors();
    createHook.clearError();
    // deleteHook n'a pas de clearAllErrors, donc on itère sur les erreurs
    Object.keys(deleteHook.errors).forEach((id) => {
      deleteHook.clearError(Number(id));
    });
  };

  /**
   * Indicateur s'il y a des erreurs dans l'un des hooks
   */
  const hasErrors = Boolean(
    createHook.error ||
      Object.keys(updateHook.errors).length > 0 ||
      Object.keys(deleteHook.errors).length > 0
  );

  return {
    // État des tâches
    tasks: tasksHook.tasks,
    loading: tasksHook.loading,
    error: tasksHook.error,
    isHealthy: tasksHook.isHealthy,
    refetch: tasksHook.refetch,
    invalidateCache: tasksHook.invalidateCache,

    // Création
    createTask: createHook.createTask,
    isCreating: createHook.isSubmitting,
    createError: createHook.error,
    lastCreatedTask: createHook.lastCreatedTask,

    // Mise à jour
    updateTask: updateHook.updateTask,
    toggleTask: updateHook.toggleTaskCompletion,
    isUpdating: updateHook.isUpdating,
    updateErrors: updateHook.errors,

    // Suppression
    deleteTask: deleteHook.deleteTask,
    isDeleting: deleteHook.isDeleting,
    deleteErrors: deleteHook.errors,
    pendingConfirmation: deleteHook.pendingConfirmation,

    // Utilitaires
    clearAllErrors,
    hasErrors,
  };
}
