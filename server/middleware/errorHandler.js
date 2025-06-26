/**
 * Middleware de gestion centralisée des erreurs
 * @param {Error} err - Erreur
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @param {Function} next - Fonction suivante
 */
function errorHandler(err, req, res, _next) {
  // Préfixe underscore pour variable intentionnellement non utilisée
  console.error("Erreur:", err.stack);

  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ error: "JSON invalide" });
  }

  res.status(500).json({ error: "Erreur interne du serveur" });
}

module.exports = errorHandler;
