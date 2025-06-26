/**
 * @fileoverview Middleware de gestion centralisée des erreurs pour l'API Express
 * @description Ce module fournit un gestionnaire d'erreurs global qui capture
 * toutes les erreurs non gérées et retourne des réponses standardisées.
 * @author Votre Nom
 * @version 1.0.0
 * @since 2024
 */

/**
 * @typedef {Object} ErrorResponse
 * @property {string} error - Message d'erreur pour le client
 * @property {string} [code] - Code d'erreur spécifique (optionnel)
 * @property {string} [timestamp] - Horodatage de l'erreur (optionnel)
 */

/**
 * Middleware de gestion centralisée des erreurs
 * @description Gestionnaire d'erreurs Express qui capture toutes les erreurs non gérées
 * dans l'application et retourne des réponses HTTP appropriées avec des messages d'erreur standardisés.
 * Ce middleware doit être défini en dernier dans la chaîne des middlewares.
 * @function errorHandler
 * @param {Error} err - Objet d'erreur capturé
 * @param {string} err.message - Message d'erreur
 * @param {string} err.stack - Stack trace de l'erreur
 * @param {string} [err.type] - Type spécifique d'erreur (pour certaines erreurs Express)
 * @param {Object} req - Objet de requête Express
 * @param {string} req.method - Méthode HTTP de la requête
 * @param {string} req.url - URL de la requête
 * @param {Object} res - Objet de réponse Express
 * @param {Function} _next - Fonction suivante (non utilisée mais requise par Express)
 * @returns {void} Envoie une réponse d'erreur au client
 * @example
 * // Utilisation dans app.js (doit être en dernier):
 * const errorHandler = require('./middleware/errorHandler');
 * 
 * // ... autres middlewares et routes ...
 * 
 * app.use(errorHandler);
 * 
 * // Exemples d'erreurs gérées:
 * 
 * // Erreur de parsing JSON:
 * POST /api/tasks
 * { invalidJson: }
 * // Réponse: 400 - { "error": "JSON invalide" }
 * 
 * // Erreur serveur générique:
 * // Réponse: 500 - { "error": "Erreur interne du serveur" }
 * 
 * // Logs dans la console:
 * // Erreur: SyntaxError: Unexpected token } in JSON at position 14
 * //   at JSON.parse (...)
 * //   at ...
 */
function errorHandler(err, req, res, _next) {
  // Log détaillé de l'erreur pour le debugging
  console.error('=== ERREUR CAPTURÉE ===');
  console.error('Timestamp:', new Date().toISOString());
  console.error('Méthode:', req.method);
  console.error('URL:', req.url);
  console.error('Message:', err.message);
  console.error('Stack:', err.stack);
  console.error('========================');

  // Gestion spécifique des erreurs de parsing JSON
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ 
      error: "JSON invalide",
      code: "INVALID_JSON",
      timestamp: new Date().toISOString()
    });
  }

  // Gestion des erreurs de validation (si non capturées ailleurs)
  if (err.name === "ValidationError") {
    return res.status(400).json({
      error: "Données de requête invalides",
      code: "VALIDATION_ERROR",
      details: err.message
    });
  }

  // Gestion des erreurs de contraintes de base de données (pour évolution future)
  if (err.code === "SQLITE_CONSTRAINT" || err.code === "ER_DUP_ENTRY") {
    return res.status(409).json({
      error: "Conflit de données",
      code: "DATA_CONFLICT"
    });
  }

  // Erreur générique du serveur (500)
  res.status(500).json({ 
    error: "Erreur interne du serveur",
    code: "INTERNAL_ERROR",
    timestamp: new Date().toISOString()
  });
}

/**
 * Export du middleware de gestion d'erreurs
 * @type {Function}
 */
module.exports = errorHandler;
