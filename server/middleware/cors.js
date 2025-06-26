/**
 * @fileoverview Configuration du middleware CORS pour l'API Express
 * @description Ce module configure les politiques CORS pour permettre la communication
 * entre le frontend Next.js (port 3000) et l'API Express (port 3001).
 * @author Votre Nom
 * @version 1.0.0
 * @since 2024
 */

const cors = require("cors");

/**
 * @typedef {Object} CorsOptions
 * @property {string|string[]} origin - Origine(s) autorisée(s) pour les requêtes CORS
 * @property {string[]} methods - Méthodes HTTP autorisées
 * @property {string[]} allowedHeaders - En-têtes autorisés dans les requêtes
 * @property {boolean} credentials - Autorisation des cookies/credentials
 */

/**
 * Configuration des options CORS pour l'API
 * @description Définit les règles CORS permettant au frontend Next.js d'accéder à l'API Express.
 * Cette configuration autorise toutes les opérations CRUD depuis localhost:3000.
 * @type {CorsOptions}
 * @example
 * // Configuration actuelle:
 * {
 *   origin: "http://localhost:3000",        // Frontend Next.js
 *   methods: ["GET", "POST", "PUT", "DELETE"], // Toutes les opérations CRUD
 *   allowedHeaders: ["Content-Type", "Authorization"], // Headers standards
 *   credentials: true                       // Support des cookies
 * }
 */
const corsOptions = {
  origin: "http://localhost:3000", // Next.js frontend
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

/**
 * Middleware CORS configuré pour l'application
 * @description Middleware Express qui applique les règles CORS définies ci-dessus.
 * À utiliser avec app.use() dans l'application principale.
 * @type {Function}
 * @returns {Function} Middleware Express configuré
 * @example
 * // Utilisation dans app.js:
 * const corsMiddleware = require('./middleware/cors');
 * app.use(corsMiddleware);
 *
 * // Permet les requêtes comme:
 * fetch('http://localhost:3001/api/tasks', {
 *   method: 'POST',
 *   headers: { 'Content-Type': 'application/json' },
 *   body: JSON.stringify({ title: 'Test', completed: false })
 * });
 */
module.exports = cors(corsOptions);
