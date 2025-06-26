// Composant pour afficher l'état de santé de l'API
export function ApiHealthStatus({
  onRetry,
  isHealthy = false,
}: {
  onRetry: () => void;
  isHealthy?: boolean;
}) {
  return (
    <div
      data-testid="api-health-status"
      className="text-center py-12"
      role="alert"
      aria-live="polite"
    >
      <p
        className={`${
          isHealthy ? "text-green-600" : "text-red-600"
        } text-lg mb-4`}
      >
        {isHealthy ? "API disponible" : "API indisponible"}
      </p>
      {!isHealthy && (
        <button
          data-testid="retry-button"
          onClick={onRetry}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          aria-label="Réessayer la connexion à l'API"
        >
          Réessayer
        </button>
      )}
    </div>
  );
}
