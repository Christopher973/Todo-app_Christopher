/**
 * @fileoverview Utilitaires pour la gestion du stockage des données sur le système de fichiers
 * @description Ce module fournit les fonctions de lecture et d'écriture pour persister les données
 * des tâches dans un fichier JSON local, simulant une base de données simple.
 * @author Votre Nom
 * @version 1.0.0
 * @since 2024
 */

const path = require("path");
const fs = require("fs").promises;

// Chemin vers le fichier data.json de Next.js (stockage partagé)
const DATA_PATH = path.join(__dirname, "../../src/lib/data.json");

/**
 * @typedef {Object} DataStore
 * @property {Task[]} tasks - Tableau des tâches stockées
 * @property {number} nextId - Prochain ID à utiliser pour une nouvelle tâche
 */

/**
 * @typedef {Object} Task
 * @property {number} id - Identifiant unique de la tâche
 * @property {string} title - Titre de la tâche
 * @property {boolean} completed - État de completion de la tâche
 */

/**
 * Lit et parse le fichier de données JSON contenant les tâches
 * @description Fonction asynchrone qui lit le fichier JSON de stockage des données.
 * Si le fichier n'existe pas ou est corrompu, retourne une structure par défaut.
 * @function readData
 * @async
 * @returns {Promise<DataStore>} Objet contenant les tâches et le prochain ID
 * @throws {Error} Erreur de lecture de fichier (gérée en interne)
 * @example
 * // Utilisation typique
 * const data = await readData();
 * console.log(data.tasks); // Tableau des tâches
 * console.log(data.nextId); // Prochain ID disponible
 *
 * // Structure retournée:
 * {
 *   tasks: [
 *     { id: 1, title: "Tâche 1", completed: false },
 *     { id: 2, title: "Tâche 2", completed: true }
 *   ],
 *   nextId: 3
 * }
 */
async function readData() {
  try {
    const data = await fs.readFile(DATA_PATH, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.warn(
      `Fichier data.json non trouvé au chemin ${DATA_PATH}, création structure par défaut`
    );
    // Retour de la structure par défaut si le fichier n'existe pas
    return { tasks: [], nextId: 1 };
  }
}

/**
 * Écrit les données dans le fichier JSON de manière atomique
 * @description Fonction asynchrone qui sauvegarde les données des tâches dans le fichier JSON.
 * L'écriture est formatée avec une indentation pour la lisibilité.
 * @function writeData
 * @async
 * @param {DataStore} data - Objet contenant les tâches et métadonnées à sauvegarder
 * @param {Task[]} data.tasks - Tableau des tâches à sauvegarder
 * @param {number} data.nextId - Prochain ID à utiliser
 * @returns {Promise<void>} Promise résolue quand l'écriture est terminée
 * @throws {Error} Erreur d'écriture de fichier (permissions, espace disque, etc.)
 * @example
 * // Sauvegarde de nouvelles données
 * const newData = {
 *   tasks: [
 *     { id: 1, title: "Nouvelle tâche", completed: false }
 *   ],
 *   nextId: 2
 * };
 *
 * await writeData(newData);
 * console.log("Données sauvegardées avec succès");
 *
 * // Le fichier JSON contiendra:
 * {
 *   "tasks": [
 *     {
 *       "id": 1,
 *       "title": "Nouvelle tâche",
 *       "completed": false
 *     }
 *   ],
 *   "nextId": 2
 * }
 */
async function writeData(data) {
  try {
    await fs.writeFile(DATA_PATH, JSON.stringify(data, null, 2), "utf8");
  } catch (error) {
    console.error(`Erreur lors de l'écriture dans ${DATA_PATH}:`, error);
    throw new Error("Impossible d'écrire dans le fichier de données");
  }
}

module.exports = {
  readData,
  writeData,
};
