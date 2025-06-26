/**
 * @fileoverview Définitions des schémas OpenAPI pour l'API des tâches
 * @description Schémas de données utilisés dans la documentation Swagger,
 * basés sur les types TypeScript définis dans src/types/
 * @author Votre Nom
 * @version 1.0.0
 * @since 2024
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Task:
 *       type: object
 *       required:
 *         - id
 *         - title
 *         - completed
 *       properties:
 *         id:
 *           type: integer
 *           description: Identifiant unique de la tâche
 *           example: 1
 *         title:
 *           type: string
 *           description: Titre de la tâche
 *           example: "Apprendre Swagger"
 *           minLength: 1
 *           maxLength: 200
 *         completed:
 *           type: boolean
 *           description: État de completion de la tâche
 *           example: false
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Date de création (optionnel)
 *           example: "2024-01-15T10:30:00Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Date de dernière modification (optionnel)
 *           example: "2024-01-15T11:45:00Z"
 *       example:
 *         id: 1
 *         title: "Apprendre Swagger"
 *         completed: false
 *
 *     CreateTaskRequest:
 *       type: object
 *       required:
 *         - title
 *         - completed
 *       properties:
 *         title:
 *           type: string
 *           description: Titre de la nouvelle tâche
 *           example: "Nouvelle tâche"
 *           minLength: 1
 *           maxLength: 200
 *         completed:
 *           type: boolean
 *           description: État initial de completion
 *           example: false
 *       example:
 *         title: "Nouvelle tâche"
 *         completed: false
 *
 *     UpdateTaskRequest:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *           description: Nouveau titre (optionnel)
 *           example: "Titre modifié"
 *           minLength: 1
 *           maxLength: 200
 *         completed:
 *           type: boolean
 *           description: Nouvel état de completion (optionnel)
 *           example: true
 *       example:
 *         title: "Titre modifié"
 *         completed: true
 *
 *     ErrorResponse:
 *       type: object
 *       required:
 *         - error
 *       properties:
 *         error:
 *           type: string
 *           description: Message d'erreur descriptif
 *           example: "Tâche non trouvée"
 *         code:
 *           type: string
 *           description: Code d'erreur spécifique
 *           example: "TASK_NOT_FOUND"
 *         timestamp:
 *           type: string
 *           format: date-time
 *           description: Horodatage de l'erreur
 *           example: "2024-01-15T10:30:00Z"
 *       example:
 *         error: "Tâche non trouvée"
 *         code: "TASK_NOT_FOUND"
 *         timestamp: "2024-01-15T10:30:00Z"
 *
 *     DeleteResponse:
 *       type: object
 *       required:
 *         - message
 *       properties:
 *         message:
 *           type: string
 *           description: Message de confirmation de suppression
 *           example: "Task deleted successfully"
 *       example:
 *         message: "Task deleted successfully"
 *
 *     ServerInfo:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: "API TODO - Serveur fonctionnel"
 *         version:
 *           type: string
 *           example: "1.0.0"
 *         endpoints:
 *           type: array
 *           items:
 *             type: string
 *           example: ["GET /api/tasks", "POST /api/tasks"]
 *         documentation:
 *           type: string
 *           example: "/api-docs"
 *         status:
 *           type: string
 *           example: "active"
 *         timestamp:
 *           type: string
 *           format: date-time
 *           example: "2024-01-15T10:30:00Z"
 */

module.exports = {};
