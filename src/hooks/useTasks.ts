import { useCallback, useEffect, useState } from "react";
import { ApiError, tasksService } from "../services/tasks.service";
import { Task } from "../types/task.type";

/**
 * @fileoverview Hook principal pour la gestion d'état des tâches
 * @description Hook centralisé qui gère le chargement, le cache et l'état global des tâches.
 * Fournit la liste des tâches avec gestion automatique du rechargement et des erreurs.
 * @author Christopher Marie-Angélique
 * @version 1.0.0
 * @since 2024
 */

/**
 * Interface pour l'état retourné par le hook useTasks
 * @interface UseTasksReturn
 */
interface UseTasksReturn {
  /** Liste des tâches actuelles */
  tasks: Task[];
  /** État de chargement initial */
  loading: boolean;
  /** Erreur de communication API */
  error: ApiError | null;
  /** État de santé de l'API */
  isHealthy: boolean;
  /** Fonction pour recharger manuellement les tâches */
  refetch: () => Promise<void>;
  /** Fonction pour invalider le cache et recharger */
  invalidateCache: () => Promise<void>;
}

/**
 * Hook principal pour la gestion d'état des tâches
 * @description Hook centralisé qui gère le chargement automatique des tâches au mount,
 * la mise en cache en mémoire, et fournit les fonctions de rechargement.
 * @returns {UseTasksReturn} État des tâches et fonctions de contrôle
 * @example
 * ```typescript
 * function TaskListComponent() {
 *   const { tasks, loading, error, refetch, isHealthy } = useTasks();
 *
 *   if (loading) return <LoadingSkeleton />;
 *   if (error) return <ErrorMessage error={error} onRetry={refetch} />;
 *   if (!isHealthy) return <ApiOfflineWarning />;
 *
 *   return (
 *     <div>
 *       {tasks.map(task => (
 *         <TaskItem key={task.id} task={task} />
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */
export function useTasks(): UseTasksReturn {
  // États locaux du hook
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<ApiError | null>(null);
  const [isHealthy, setIsHealthy] = useState<boolean>(true);

  /**
   * Fonction de chargement des tâches avec gestion d'erreurs
   * @private
   * @async
   * @param {boolean} showLoading - Afficher l'état de chargement
   */
  const fetchTasks = useCallback(async (showLoading: boolean = false) => {
    try {
      if (showLoading) {
        setLoading(true);
      }
      setError(null);

      // Chargement des tâches via le service
      const fetchedTasks = await tasksService.getAllTasks();
      setTasks(fetchedTasks);
      setIsHealthy(true);
    } catch (err) {
      console.error("Erreur lors du chargement des tâches:", err);

      if (err instanceof ApiError) {
        setError(err);

        // Gestion spécifique des erreurs réseau
        if (err.code === "NETWORK_ERROR" || err.code === "REQUEST_TIMEOUT") {
          setIsHealthy(false);
        }
      } else {
        // Erreur inattendue
        setError(
          new ApiError(
            "Erreur inattendue lors du chargement",
            500,
            "UNKNOWN_ERROR"
          )
        );
      }
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  }, []);

  /**
   * Fonction de rechargement manuel des tâches
   * @public
   * @async
   */
  const refetch = useCallback(async () => {
    await fetchTasks(true);
  }, [fetchTasks]);

  /**
   * Fonction pour invalider le cache et recharger
   * @public
   * @async
   */
  const invalidateCache = useCallback(async () => {
    setTasks([]);
    await fetchTasks(true);
  }, [fetchTasks]);

  // Chargement initial au mount du composant
  useEffect(() => {
    fetchTasks(true);
  }, [fetchTasks]);

  // Health check périodique si l'API est marquée comme indisponible
  useEffect(() => {
    if (!isHealthy) {
      const healthCheckInterval = setInterval(async () => {
        try {
          const healthy = await tasksService.checkApiHealth();
          if (healthy) {
            setIsHealthy(true);
            setError(null);
            await fetchTasks(false); // Recharger sans loading
          }
        } catch {
          // API toujours indisponible
        }
      }, 30000); // Vérification toutes les 30 secondes

      return () => clearInterval(healthCheckInterval);
    }
  }, [isHealthy, fetchTasks]);

  return {
    tasks,
    loading,
    error,
    isHealthy,
    refetch,
    invalidateCache,
  };
}

/**
 * Export par défaut du hook
 */
export default useTasks;
