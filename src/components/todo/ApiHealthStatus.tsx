// Composant pour afficher l'état de santé de l'API
export function ApiHealthStatus({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="text-center py-12">
      <p className="text-red-600 text-lg mb-4">API indisponible</p>
      <button
        onClick={onRetry}
        className="px-4 py-2 bg-blue-600 text-white rounded"
      >
        Réessayer
      </button>
    </div>
  );
}
