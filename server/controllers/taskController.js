const { readData, writeData } = require("../utils/storage");

/**
 * Récupère toutes les tâches
 * GET /api/tasks
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
async function getAllTasks(req, res) {
  try {
    const data = await readData();
    res.json(data.tasks);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Erreur lors de la récupération des tâches" });
  }
}

/**
 * Crée une nouvelle tâche
 * POST /api/tasks
 * Body: { "title": "Nom de la tâche", "completed": false }
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
async function createTask(req, res) {
  try {
    const { title, completed } = req.body;

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
    res.status(500).json({ error: "Erreur lors de la création de la tâche" });
  }
}

/**
 * Met à jour une tâche existante
 * PUT /api/tasks/:id
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
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

    if (title !== undefined) data.tasks[taskIndex].title = title;
    if (completed !== undefined) data.tasks[taskIndex].completed = completed;

    await writeData(data);
    res.json(data.tasks[taskIndex]);
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la mise à jour" });
  }
}

/**
 * Supprime une tâche
 * DELETE /api/tasks/:id
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
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
    res.status(500).json({ error: "Erreur lors de la suppression" });
  }
}

module.exports = {
  getAllTasks,
  createTask,
  updateTask,
  deleteTask,
};
