"use client";

import { Task, UpdateTaskRequest } from "@/src/types/task.type";
import { ApiError } from "@/src/services/tasks.service";
import { TaskItem } from "./TaskItem";
import { Alert, AlertTitle, AlertDescription } from "@/src/components/ui/alert";

interface TaskListProps {
  tasks: Task[];
  loading: boolean;
  error: ApiError | null;
  onUpdate: (id: number, updates: UpdateTaskRequest) => Promise<Task | null>;
  onDelete: (task: Task) => Promise<boolean>;
  isUpdating: Record<number, boolean>;
  isDeleting: Record<number, boolean>;
  updateErrors: Record<number, ApiError>;
  deleteErrors: Record<number, ApiError>;
}

export function TaskList({
  tasks,
  loading,
  error,
  onUpdate,
  onDelete,
  isUpdating,
  isDeleting,
  updateErrors,
  deleteErrors,
}: TaskListProps) {
  // États de chargement
  if (loading) {
    return (
      <div data-testid="loading-skeleton" className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse bg-gray-200 h-16 rounded-lg" />
        ))}
      </div>
    );
  }

  // Gestion des erreurs
  if (error) {
    return (
      <Alert variant="destructive" data-testid="error-message">
        <AlertTitle>Erreur de chargement</AlertTitle>
        <AlertDescription>{error.message}</AlertDescription>
      </Alert>
    );
  }

  // État vide
  if (tasks.length === 0) {
    return (
      <div data-testid="empty-state" className="text-center py-12">
        <p className="text-gray-500 text-lg">Aucune tâche pour le moment</p>
        <p className="text-gray-400">
          Commencez par ajouter votre première tâche !
        </p>
      </div>
    );
  }

  // Liste des tâches
  return (
    <div data-testid="task-list" className="space-y-4">
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          onUpdate={onUpdate}
          onDelete={onDelete}
          isUpdating={isUpdating[task.id] || false}
          isDeleting={isDeleting[task.id] || false}
          updateError={updateErrors[task.id]}
          deleteError={deleteErrors[task.id]}
        />
      ))}
    </div>
  );
}
