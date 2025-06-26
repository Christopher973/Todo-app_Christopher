/**
 * @fileoverview Configuration Swagger/OpenAPI pour l'API des tâches
 * @description Configuration centralisée pour la génération de documentation OpenAPI 3.0
 * basée sur les commentaires JSDoc existants dans les contrôleurs et routes.
 * @author Christopher Marie-Angélique
 * @version 1.0.0
 * @since 2024
 */

const swaggerJSDoc = require("swagger-jsdoc");

/**
 * Configuration OpenAPI 3.0 pour l'API TODO
 * @description Définit les métadonnées de base, serveurs et chemins vers les fichiers JSDoc
 * @type {Object}
 */
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "TODO API - Qualité et Tests",
      version: "1.0.0",
      description:
        "API REST pour la gestion de tâches (To-Do List) - Évaluation Master Développement Fullstack",
      contact: {
        name: "Support API",
        email: "christopher.marieangelique.pro@gmail.com",
      },
      license: {
        name: "MIT",
        url: "https://opensource.org/licenses/MIT",
      },
    },
    servers: [
      {
        url: "http://localhost:3001",
        description: "Serveur de développement Express",
      },
    ],
    tags: [
      // {
      //   name: "todo",
      //   description: "Opérations CRUD sur les tâches",
      // },
    ],
  },
  apis: [
    "./routes/*.js", // Routes avec annotations Swagger
    "./controllers/*.js", // Contrôleurs avec JSDoc
    "./docs/*.js", // Définitions de schémas (à créer)
  ],
};

/**
 * Spécification OpenAPI générée
 * @type {Object}
 */
const swaggerSpec = swaggerJSDoc(swaggerOptions);

module.exports = swaggerSpec;
