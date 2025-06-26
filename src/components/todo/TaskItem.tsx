"use client";

import { useState } from "react";
import { Task, UpdateTaskRequest } from "@/src/types/task.type";
import { ApiError } from "@/src/services/tasks.service";
import { Pencil, Trash2, Check, X } from "lucide-react";

interface TaskItemProps {
  task: Task;
  onUpdate: (id: number, updates: UpdateTaskRequest) => Promise<Task | null>;
  onDelete: (task: Task) => Promise<boolean>;
  isUpdating: boolean;
  isDeleting: boolean;
  updateError?: ApiError;
  deleteError?: ApiError;
}

export function TaskItem({
  task,
  onUpdate,
  onDelete,
  isUpdating,
  isDeleting,
  updateError,
  deleteError,
}: TaskItemProps) {
  // État local d'édition
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);

  // Handlers d'actions
  const handleToggleComplete = async () => {
    await onUpdate(task.id, { completed: !task.completed });
  };

  const handleSaveEdit = async () => {
    if (editTitle.trim().length === 0) return;

    const updated = await onUpdate(task.id, { title: editTitle.trim() });
    if (updated) {
      setIsEditing(false);
    }
  };

  const handleCancelEdit = () => {
    setEditTitle(task.title);
    setIsEditing(false);
  };

  const handleDelete = async () => {
    const confirmed = window.confirm(
      `Êtes-vous sûr de vouloir supprimer "${task.title}" ? Cette action est irréversible.`
    );
    if (confirmed) {
      await onDelete(task);
    }
  };

  return (
    <div
      data-testid="task-item"
      className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex items-center gap-4">
        {/* Checkbox de completion */}
        <button
          data-testid="task-toggle"
          aria-label={
            task.completed
              ? "Marquer comme non complétée"
              : "Marquer comme complétée"
          }
          onClick={handleToggleComplete}
          disabled={isUpdating || isDeleting}
          className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
            task.completed
              ? "bg-green-500 border-green-500 text-white"
              : "border-gray-300 hover:border-green-400"
          }`}
        >
          <input
            data-testid="task-checkbox"
            type="checkbox"
            checked={task.completed}
            onChange={() => {}} // Géré par le bouton parent
            className="sr-only"
          />
          {task.completed && <Check size={12} />}
        </button>

        {/* Titre (éditable ou lecture) */}
        <div className="flex-1">
          {isEditing ? (
            <input
              data-testid="edit-input"
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSaveEdit();
                if (e.key === "Escape") handleCancelEdit();
              }}
              disabled={isUpdating}
              className="w-full px-2 py-1 border border-gray-300 rounded"
              autoFocus
              maxLength={200}
            />
          ) : (
            <span
              data-testid="task-title"
              className={`${
                task.completed ? "line-through text-gray-500" : "text-gray-900"
              }`}
            >
              {task.title}
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <button
                data-testid="save-edit"
                onClick={handleSaveEdit}
                disabled={isUpdating || editTitle.trim().length === 0}
                className="p-1 text-green-600 hover:bg-green-100 rounded"
                aria-label="Sauvegarder les modifications"
              >
                <Check size={16} />
              </button>
              <button
                data-testid="cancel-edit"
                onClick={handleCancelEdit}
                disabled={isUpdating}
                className="p-1 text-gray-600 hover:bg-gray-100 rounded"
                aria-label="Annuler les modifications"
              >
                <X size={16} />
              </button>
            </>
          ) : (
            <>
              <button
                data-testid="task-edit"
                onClick={() => setIsEditing(true)}
                disabled={isUpdating || isDeleting}
                className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                aria-label="Modifier la tâche"
              >
                <Pencil size={16} />
              </button>
              <button
                data-testid="task-delete"
                onClick={handleDelete}
                disabled={isUpdating || isDeleting}
                className="p-1 text-red-600 hover:bg-red-100 rounded"
                aria-label="Supprimer la tâche"
              >
                <Trash2 size={16} />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Affichage des erreurs */}
      {(updateError || deleteError) && (
        <div data-testid="error-message" className="mt-2 text-sm text-red-600">
          {updateError?.message || deleteError?.message}
        </div>
      )}

      {/* États de chargement */}
      {isUpdating && (
        <div
          data-testid="updating-indicator"
          className="mt-2 text-sm text-gray-500"
        >
          Mise à jour...
        </div>
      )}
      {isDeleting && (
        <div
          data-testid="deleting-indicator"
          className="mt-2 text-sm text-gray-500"
        >
          Suppression...
        </div>
      )}
    </div>
  );
}
