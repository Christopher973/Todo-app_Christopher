/**
 * @fileoverview Définition des routes pour l'API REST des tâches
 * @description Ce module configure toutes les routes relatives à la gestion des tâches.
 * Chaque route est associée à son contrôleur correspondant et respecte les spécifications REST.
 * @author Votre Nom
 * @version 1.0.0
 * @since 2024
 */

const express = require("express");
const {
  getAllTasks,
  createTask,
  updateTask,
  deleteTask,
} = require("../controllers/taskController");

/**
 * Router Express pour les endpoints de gestion des tâches
 * @type {express.Router}
 */
const router = express.Router();

/**
 * @namespace TaskRoutes
 * @description Ensemble des routes pour la gestion des tâches via API REST
 */

/**
 * Route pour récupérer toutes les tâches
 * @name GET/tasks
 * @function
 * @memberof TaskRoutes
 * @description Endpoint pour obtenir la liste complète des tâches stockées
 * @route GET /api/tasks
 * @returns {Task[]} 200 - Tableau des tâches
 * @returns {ErrorResponse} 500 - Erreur serveur
 * @example
 * // Requête
 * GET /api/tasks
 *
 * // Réponse
 * HTTP/1.1 200 OK
 * Content-Type: application/json
 *
 * [
 *   { "id": 1, "title": "Ma tâche", "completed": false }
 * ]
 */
router.get("/tasks", getAllTasks);

/**
 * @swagger
 * /api/tasks:
 *   get:
 *     summary: Récupère toutes les tâches
 *     description: Endpoint pour obtenir la liste complète des tâches stockées
 *     tags: [Tasks]
 *     responses:
 *       200:
 *         description: Liste des tâches récupérée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Task'
 *             examples:
 *               empty:
 *                 summary: Aucune tâche
 *                 value: []
 *               withTasks:
 *                 summary: Avec des tâches
 *                 value:
 *                   - id: 1
 *                     title: "Ma première tâche"
 *                     completed: false
 *                   - id: 2
 *                     title: "Ma seconde tâche"
 *                     completed: true
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Erreur lors de la récupération des tâches"
 */
router.get("/tasks", getAllTasks);

/**
 * Route pour créer une nouvelle tâche
 * @name POST/tasks
 * @function
 * @memberof TaskRoutes
 * @description Endpoint pour créer une nouvelle tâche avec validation
 * @route POST /api/tasks
 * @param {CreateTaskRequest} request.body - Données de la tâche à créer
 * @returns {Task} 201 - Tâche créée avec ID généré
 * @returns {ErrorResponse} 400 - Données invalides
 * @returns {ErrorResponse} 500 - Erreur serveur
 * @example
 * // Requête
 * POST /api/tasks
 * Content-Type: application/json
 *
 * {
 *   "title": "Nouvelle tâche",
 *   "completed": false
 * }
 *
 * // Réponse
 * HTTP/1.1 201 Created
 * Content-Type: application/json
 *
 * {
 *   "id": 1,
 *   "title": "Nouvelle tâche",
 *   "completed": false
 * }
 */
router.post("/tasks", createTask);

/**
 * @swagger
 * /api/tasks:
 *   post:
 *     summary: Crée une nouvelle tâche
 *     description: Endpoint pour créer une nouvelle tâche avec validation des données
 *     tags: [Tasks]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateTaskRequest'
 *           examples:
 *             example1:
 *               summary: Tâche non terminée
 *               value:
 *                 title: "Apprendre Swagger"
 *                 completed: false
 *             example2:
 *               summary: Tâche déjà terminée
 *               value:
 *                 title: "Tâche déjà faite"
 *                 completed: true
 *     responses:
 *       201:
 *         description: Tâche créée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
 *             example:
 *               id: 3
 *               title: "Apprendre Swagger"
 *               completed: false
 *       400:
 *         description: Données de requête invalides
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Données invalides"
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post("/tasks", createTask);

/**
 * Route pour mettre à jour une tâche existante
 * @name PUT/tasks/:id
 * @function
 * @memberof TaskRoutes
 * @description Endpoint pour modifier une tâche existante (mise à jour partielle ou complète)
 * @route PUT /api/tasks/:id
 * @param {number} request.params.id - ID de la tâche à modifier
 * @param {UpdateTaskRequest} request.body - Nouvelles données pour la tâche
 * @returns {Task} 200 - Tâche mise à jour
 * @returns {ErrorResponse} 404 - Tâche non trouvée
 * @returns {ErrorResponse} 500 - Erreur serveur
 * @example
 * // Requête
 * PUT /api/tasks/1
 * Content-Type: application/json
 *
 * {
 *   "title": "Tâche modifiée",
 *   "completed": true
 * }
 *
 * // Réponse
 * HTTP/1.1 200 OK
 * Content-Type: application/json
 *
 * {
 *   "id": 1,
 *   "title": "Tâche modifiée",
 *   "completed": true
 * }
 */
router.put("/tasks/:id", updateTask);

/**
 * @swagger
 * /api/tasks/{id}:
 *   put:
 *     summary: Met à jour une tâche existante
 *     description: Endpoint pour modifier partiellement ou complètement une tâche existante
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la tâche à modifier
 *         schema:
 *           type: integer
 *           example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateTaskRequest'
 *           examples:
 *             updateComplete:
 *               summary: Mise à jour complète
 *               value:
 *                 title: "Tâche modifiée"
 *                 completed: true
 *             updatePartial:
 *               summary: Mise à jour partielle (titre seulement)
 *               value:
 *                 title: "Nouveau titre"
 *             updateStatus:
 *               summary: Mise à jour du statut seulement
 *               value:
 *                 completed: true
 *     responses:
 *       200:
 *         description: Tâche mise à jour avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
 *             example:
 *               id: 1
 *               title: "Tâche modifiée"
 *               completed: true
 *       404:
 *         description: Tâche non trouvée
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Tâche non trouvée"
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.put("/tasks/:id", updateTask);

/**
 * Route pour supprimer une tâche
 * @name DELETE/tasks/:id
 * @function
 * @memberof TaskRoutes
 * @description Endpoint pour supprimer définitivement une tâche
 * @route DELETE /api/tasks/:id
 * @param {number} request.params.id - ID de la tâche à supprimer
 * @returns {DeleteResponse} 200 - Confirmation de suppression
 * @returns {ErrorResponse} 404 - Tâche non trouvée
 * @returns {ErrorResponse} 500 - Erreur serveur
 * @example
 * // Requête
 * DELETE /api/tasks/1
 *
 * // Réponse
 * HTTP/1.1 200 OK
 * Content-Type: application/json
 *
 * {
 *   "message": "Task deleted successfully"
 * }
 */
router.delete("/tasks/:id", deleteTask);

/**
 * @swagger
 * /api/tasks/{id}:
 *   delete:
 *     summary: Supprime une tâche
 *     description: Endpoint pour supprimer définitivement une tâche existante
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la tâche à supprimer
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Tâche supprimée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DeleteResponse'
 *             example:
 *               message: "Task deleted successfully"
 *       404:
 *         description: Tâche non trouvée
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Tâche non trouvée"
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete("/tasks/:id", deleteTask);

/**
 * Export du router configuré avec toutes les routes
 * @type {express.Router}
 */
module.exports = router;
