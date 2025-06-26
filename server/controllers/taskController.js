/**
 * @fileoverview Contrôleurs pour la gestion des tâches via API REST
 * @description Ce module contient les contrôleurs pour toutes les opérations CRUD sur les tâches.
 * Chaque contrôleur gère un endpoint spécifique de l'API REST conforme aux spécifications du projet.
 * @author Votre Nom
 * @version 1.0.0
 * @since 2024
 */

const { readData, writeData } = require("../utils/storage");

/**
 * @typedef {Object} Task
 * @property {number} id - Identifiant unique de la tâche
 * @property {string} title - Titre de la tâche
 * @property {boolean} completed - État de completion de la tâche
 * @property {string} [createdAt] - Date de création (optionnel)
 * @property {string} [updatedAt] - Date de dernière modification (optionnel)
 */

/**
 * @typedef {Object} ErrorResponse
 * @property {string} error - Message d'erreur descriptif
 */

/**
 * @typedef {Object} DeleteResponse
 * @property {string} message - Message de confirmation de suppression
 */

/**
 * Récupère toutes les tâches stockées
 * @description Endpoint pour récupérer la liste complète des tâches.
 * Retourne un tableau vide si aucune tâche n'existe.
 * @route GET /api/tasks
 * @function getAllTasks
 * @async
 * @param {Object} req - Objet de requête Express
 * @param {Object} res - Objet de réponse Express
 * @returns {Promise<void>} Réponse JSON contenant le tableau des tâches
 * @throws {Error} 500 - Erreur lors de la lecture du fichier de données
 * @example
 * // Exemple d'appel API
 * GET /api/tasks
 *
 * // Réponse attendue:
 * [
 *   { "id": 1, "title": "Ma première tâche", "completed": false },
 *   { "id": 2, "title": "Ma seconde tâche", "completed": true }
 * ]
 *
 * // Réponse si aucune tâche:
 * []
 */
async function getAllTasks(req, res) {
  try {
    const data = await readData();
    res.json(data.tasks);
  } catch (error) {
    console.error("Erreur lors de la récupération des tâches:", error);
    res
      .status(500)
      .json({ error: "Erreur lors de la récupération des tâches" });
  }
}

/**
 * Crée une nouvelle tâche dans le système
 * @description Endpoint pour créer une nouvelle tâche avec validation des données.
 * L'ID est généré automatiquement de manière incrémentale.
 * @route POST /api/tasks
 * @function createTask
 * @async
 * @param {Object} req - Objet de requête Express
 * @param {Object} req.body - Corps de la requête
 * @param {string} req.body.title - Titre de la tâche (obligatoire, non vide)
 * @param {boolean} req.body.completed - État de completion (obligatoire, booléen)
 * @param {Object} res - Objet de réponse Express
 * @returns {Promise<void>} Réponse JSON contenant la tâche créée avec son ID
 * @throws {Error} 400 - Données de requête invalides (titre manquant ou completed non booléen)
 * @throws {Error} 500 - Erreur lors de l'écriture dans le fichier de données
 * @example
 * // Exemple d'appel API
 * POST /api/tasks
 * Content-Type: application/json
 *
 * {
 *   "title": "Apprendre JSDoc",
 *   "completed": false
 * }
 *
 * // Réponse attendue (201):
 * {
 *   "id": 3,
 *   "title": "Apprendre JSDoc",
 *   "completed": false
 * }
 *
 * // Exemple d'erreur (400):
 * {
 *   "error": "Données invalides"
 * }
 */
async function createTask(req, res) {
  try {
    const { title, completed } = req.body;

    // Validation des données d'entrée
    if (!title || typeof completed !== "boolean") {
      return res.status(400).json({ error: "Données invalides" });
    }

    const data = await readData();
    const newTask = {
      id: data.nextId,
      title,
      completed,
    };

    data.tasks.push(newTask);
    data.nextId++;

    await writeData(data);
    res.status(201).json(newTask);
  } catch (error) {
    console.error("Erreur lors de la création de la tâche:", error);
    res.status(500).json({ error: "Erreur lors de la création de la tâche" });
  }
}

/**
 * Met à jour une tâche existante par son ID
 * @description Endpoint pour modifier partiellement ou complètement une tâche existante.
 * Seuls les champs fournis sont mis à jour (mise à jour partielle supportée).
 * @route PUT /api/tasks/:id
 * @function updateTask
 * @async
 * @param {Object} req - Objet de requête Express
 * @param {Object} req.params - Paramètres de la route
 * @param {string} req.params.id - ID de la tâche à modifier (converti en nombre)
 * @param {Object} req.body - Corps de la requête
 * @param {string} [req.body.title] - Nouveau titre de la tâche (optionnel)
 * @param {boolean} [req.body.completed] - Nouvel état de completion (optionnel)
 * @param {Object} res - Objet de réponse Express
 * @returns {Promise<void>} Réponse JSON contenant la tâche mise à jour
 * @throws {Error} 404 - Tâche avec l'ID spécifié non trouvée
 * @throws {Error} 500 - Erreur lors de l'écriture dans le fichier de données
 * @example
 * // Exemple d'appel API (mise à jour complète)
 * PUT /api/tasks/1
 * Content-Type: application/json
 *
 * {
 *   "title": "Tâche modifiée",
 *   "completed": true
 * }
 *
 * // Réponse attendue (200):
 * {
 *   "id": 1,
 *   "title": "Tâche modifiée",
 *   "completed": true
 * }
 *
 * // Exemple de mise à jour partielle
 * PUT /api/tasks/1
 * {
 *   "completed": true
 * }
 *
 * // Exemple d'erreur (404):
 * {
 *   "error": "Tâche non trouvée"
 * }
 */
async function updateTask(req, res) {
  try {
    const id = parseInt(req.params.id);
    const { title, completed } = req.body;

    const data = await readData();
    const taskIndex = data.tasks.findIndex((task) => task.id === id);

    if (taskIndex === -1) {
      return res.status(404).json({ error: "Tâche non trouvée" });
    }

    // Mise à jour conditionnelle des champs
    if (title !== undefined) data.tasks[taskIndex].title = title;
    if (completed !== undefined) data.tasks[taskIndex].completed = completed;

    await writeData(data);
    res.json(data.tasks[taskIndex]);
  } catch (error) {
    console.error("Erreur lors de la mise à jour:", error);
    res.status(500).json({ error: "Erreur lors de la mise à jour" });
  }
}

/**
 * Supprime définitivement une tâche par son ID
 * @description Endpoint pour supprimer une tâche existante du système.
 * La suppression est définitive et irréversible.
 * @route DELETE /api/tasks/:id
 * @function deleteTask
 * @async
 * @param {Object} req - Objet de requête Express
 * @param {Object} req.params - Paramètres de la route
 * @param {string} req.params.id - ID de la tâche à supprimer (converti en nombre)
 * @param {Object} res - Objet de réponse Express
 * @returns {Promise<void>} Réponse JSON confirmant la suppression
 * @throws {Error} 404 - Tâche avec l'ID spécifié non trouvée
 * @throws {Error} 500 - Erreur lors de l'écriture dans le fichier de données
 * @example
 * // Exemple d'appel API
 * DELETE /api/tasks/1
 *
 * // Réponse attendue (200):
 * {
 *   "message": "Task deleted successfully"
 * }
 *
 * // Exemple d'erreur (404):
 * {
 *   "error": "Tâche non trouvée"
 * }
 */
async function deleteTask(req, res) {
  try {
    const id = parseInt(req.params.id);
    const data = await readData();

    const taskIndex = data.tasks.findIndex((task) => task.id === id);

    if (taskIndex === -1) {
      return res.status(404).json({ error: "Tâche non trouvée" });
    }

    data.tasks.splice(taskIndex, 1);
    await writeData(data);

    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error("Erreur lors de la suppression:", error);
    res.status(500).json({ error: "Erreur lors de la suppression" });
  }
}

module.exports = {
  getAllTasks,
  createTask,
  updateTask,
  deleteTask,
};
