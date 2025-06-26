/**
 * @fileoverview Application Express principale pour l'API REST des tâches
 * @description Point d'entrée de l'API Express qui configure tous les middlewares,
 * routes et démarre le serveur. Cette API communique avec le frontend Next.js
 * et utilise un fichier JSON comme système de stockage.
 * @author Votre Nom
 * @version 1.0.0
 * @since 2024
 */

const express = require("express");
const helmet = require("helmet");
const morgan = require("morgan");

// Import Swagger
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger.config");

// Import des middleware personnalisés
const corsMiddleware = require("./middleware/cors");
const errorHandler = require("./middleware/errorHandler");

// Import des routes
const taskRoutes = require("./routes/tasks");

/**
 * Instance de l'application Express
 * @type {express.Application}
 */
const app = express();

/**
 * Port d'écoute du serveur (3001 par défaut pour éviter les conflits avec Next.js)
 * @type {number}
 * @default 3001
 */
const PORT = process.env.PORT || 3001;

/**
 * @namespace ServerConfiguration
 * @description Configuration des middlewares et routes de l'application Express
 */

/**
 * Configuration des middlewares de sécurité et de logging
 * @memberof ServerConfiguration
 * @description Application des middlewares dans l'ordre approprié pour la sécurité
 * et le monitoring des requêtes
 */

// Middleware de sécurité HTTP avec Helmet
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }, // Permet les ressources cross-origin
  })
);

// Middleware de logging des requêtes HTTP
app.use(morgan("combined"));

/**
 * Configuration CORS pour la communication avec Next.js
 * @memberof ServerConfiguration
 * @description Active le support CORS pour permettre les requêtes depuis localhost:3000
 */
app.use(corsMiddleware);

/**
 * Configuration du parsing JSON pour les requêtes
 * @memberof ServerConfiguration
 * @description Permet le parsing automatique des corps de requêtes JSON
 */
app.use(
  express.json({
    limit: "10mb", // Limite de taille pour les requêtes JSON
  })
);

/**
 * Configuration des routes API avec préfixe /api
 * @memberof ServerConfiguration
 * @description Toutes les routes des tâches sont accessibles avec le préfixe /api
 */
app.use("/api", taskRoutes);

/**
 * Route de documentation Swagger
 * @name GET/api-docs
 * @function
 * @memberof ServerConfiguration
 * @description Interface Swagger UI interactive pour la documentation API
 * @route GET /api-docs
 * @returns {HTML} Interface Swagger UI
 * @example
 * // Accès à la documentation:
 * GET http://localhost:3001/api-docs
 *
 * // Fonctionnalités disponibles:
 * - Interface interactive pour tester les endpoints
 * - Documentation complète des schémas
 * - Exemples de requêtes/réponses
 * - Validation des données en temps réel
 */
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customCss: ".swagger-ui .topbar { display: none }",
    customSiteTitle: "TODO API - Documentation",
    customfavIcon: "/favicon.ico",
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      docExpansion: "list",
      filter: true,
      showExtensions: true,
      showCommonExtensions: true,
    },
  })
);

/**
 * Route JSON pour la spécification OpenAPI
 * @name GET/api-docs.json
 * @function
 * @description Retourne la spécification OpenAPI au format JSON
 * @route GET /api-docs.json
 * @returns {Object} Spécification OpenAPI 3.0
 */
app.get("/api-docs.json", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(swaggerSpec);
});

/**
 * Route de test et documentation des endpoints disponibles
 * @name GET/
 * @function
 * @memberof ServerConfiguration
 * @description Endpoint de base qui affiche les informations du serveur
 * et la liste des endpoints disponibles
 * @route GET /
 * @returns {Object} 200 - Informations du serveur et endpoints
 * @example
 * // Requête:
 * GET http://localhost:3001/
 *
 * // Réponse:
 * {
 *   "message": "API TODO - Serveur fonctionnel",
 *   "version": "1.0.0",
 *   "endpoints": [
 *     "GET /api/tasks",
 *     "POST /api/tasks",
 *     "PUT /api/tasks/:id",
 *     "DELETE /api/tasks/:id"
 *   ],
 *   "documentation": "/api-docs",
 *   "status": "active"
 * }
 */
app.get("/", (req, res) => {
  res.json({
    message: "API TODO - Serveur fonctionnel",
    version: "1.0.0",
    endpoints: [
      "GET /api/tasks - Récupérer toutes les tâches",
      "POST /api/tasks - Créer une nouvelle tâche",
      "PUT /api/tasks/:id - Mettre à jour une tâche",
      "DELETE /api/tasks/:id - Supprimer une tâche",
    ],
    documentation: {
      swagger: "/api-docs",
      openapi: "/api-docs.json",
    },
    cors: {
      allowedOrigin: "http://localhost:3000",
      allowedMethods: ["GET", "POST", "PUT", "DELETE"],
    },
    storage: "JSON file (src/lib/data.json)",
    status: "active",
    timestamp: new Date().toISOString(),
  });
});

/**
 * Route pour la vérification de santé du serveur
 * @name GET/health
 * @function
 * @memberof ServerConfiguration
 * @description Endpoint de health check pour vérifier le statut du serveur
 * @route GET /health
 * @returns {Object} 200 - Statut de santé du serveur
 */
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    memory: process.memoryUsage(),
    documentation: "http://localhost:3001/api-docs",
  });
});

/**
 * Middleware de gestion d'erreurs (doit être en dernier)
 * @memberof ServerConfiguration
 * @description Gestionnaire global des erreurs non capturées
 */
app.use(errorHandler);

/**
 * Démarrage du serveur Express
 * @memberof ServerConfiguration
 * @description Lance le serveur sur le port configuré et affiche les informations de connexion
 * @example
 * // Output dans la console:
 * 🚀 Serveur Express démarré sur http://localhost:3001
 * 📝 Endpoints API disponibles sur http://localhost:3001/api/tasks
 * 🔧 Health check disponible sur http://localhost:3001/health
 * 📊 Logs des requêtes activés (format combined)
 */
app.listen(PORT, () => {
  console.log("=".repeat(60));
  console.log("🚀 API TODO EXPRESS - DÉMARRAGE RÉUSSI");
  console.log("=".repeat(60));
  console.log(`📍 Serveur: http://localhost:${PORT}`);
  console.log(`📝 API: http://localhost:${PORT}/api/tasks`);
  console.log(`📚 Documentation: http://localhost:${PORT}/api-docs`);
  console.log(`📋 OpenAPI JSON: http://localhost:${PORT}/api-docs.json`);
  console.log(`💚 Health: http://localhost:${PORT}/health`);
  console.log(`🌐 CORS: Autorisé depuis http://localhost:3000`);
  console.log(`💾 Stockage: Fichier JSON partagé`);
  console.log(`📊 Logging: Activé (format combined)`);
  console.log(`🔒 Sécurité: Helmet activé`);
  console.log("=".repeat(60));
});

/**
 * Export de l'application pour les tests
 * @type {express.Application}
 */
module.exports = app;
