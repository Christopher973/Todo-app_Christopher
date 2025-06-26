"use client";

import { useState } from "react";
import { CreateTaskRequest } from "@/src/types/task.type";
import { ApiError } from "@/src/services/tasks.service";
import { Alert, AlertTitle, AlertDescription } from "@/src/components/ui/alert";

interface TaskFormProps {
  onSubmit: (taskData: CreateTaskRequest) => Promise<void>;
  loading: boolean;
  error: ApiError | null;
}

export function TaskForm({ onSubmit, loading, error }: TaskFormProps) {
  // État local du formulaire
  const [title, setTitle] = useState("");

  // Handler de soumission avec validation
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (title.trim().length === 0) return;

    await onSubmit({
      title: title.trim(),
      completed: false,
    });

    // Reset du formulaire après succès
    setTitle("");
  };

  return (
    <div className="mb-8">
      {/* Affichage des erreurs */}
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertTitle>Erreur</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      )}

      {/* Formulaire */}
      <form onSubmit={handleSubmit} className="flex gap-4">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ajouter une nouvelle tâche..."
          disabled={loading}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
          maxLength={200}
        />

        <button
          type="submit"
          disabled={loading || title.trim().length === 0}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? "Création..." : "Ajouter"}
        </button>
      </form>
    </div>
  );
}
