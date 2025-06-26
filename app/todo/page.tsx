"use client";

import { ApiHealthStatus } from "@/src/components/todo/ApiHealthStatus";
import { ErrorBoundary } from "@/src/components/todo/ErrorBoundary";
import { TaskForm } from "@/src/components/todo/TaskForm";
import { TaskList } from "@/src/components/todo/TaskList";
import { useTasksManager } from "@/src/hooks";
import { CreateTaskRequest } from "@/src/types/task.type";

export default function TodoListPage() {
  // Intégration du hook composite pour gestion d'état centralisée
  const {
    // État des tâches
    tasks,
    loading,
    error,
    isHealthy,
    refetch,

    // Actions CRUD
    createTask,
    updateTask,
    deleteTask,

    // États de mutation
    isCreating,
    isUpdating,
    isDeleting,

    // États d'erreur spécifiques
    createError,
    updateErrors,
    deleteErrors,

    // Utilitaires
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    clearAllErrors,
    hasErrors,
  } = useTasksManager();

  // Handlers d'événements configurés
  const handleCreateTask = async (taskData: CreateTaskRequest) => {
    const newTask = await createTask(taskData);
    if (newTask) {
      // Feedback utilisateur via console (simple pour l'école)
      console.log("Tâche créée avec succès:", newTask.title);
    }
  };

  // Rendu conditionnel basé sur l'état
  if (!isHealthy) {
    return <ApiHealthStatus onRetry={refetch} />;
  }

  return (
    <ErrorBoundary>
      <div className="container mx-auto max-w-4xl p-6">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Ma liste de tâches
          </h1>
          <p className="text-gray-600 mt-2">
            Gérez vos tâches quotidiennes simplement
          </p>
        </header>

        {/* Formulaire de création */}
        <TaskForm
          onSubmit={handleCreateTask}
          loading={isCreating}
          error={createError}
        />

        {/* Liste des tâches */}
        <TaskList
          tasks={tasks}
          loading={loading}
          error={error}
          onUpdate={updateTask}
          onDelete={deleteTask}
          isUpdating={isUpdating}
          isDeleting={isDeleting}
          updateErrors={updateErrors}
          deleteErrors={deleteErrors}
        />

        {/* Debug info (pour développement) */}
        {process.env.NODE_ENV === "development" && (
          <div className="mt-8 p-4 bg-gray-100 rounded">
            <p>
              Debug: {tasks.length} tâche(s) | Erreurs:{" "}
              {hasErrors ? "Oui" : "Non"}
            </p>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}
