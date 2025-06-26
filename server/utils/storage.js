const path = require("path");
const fs = require("fs").promises;

// Chemin vers le fichier data.json de Next.js
const DATA_PATH = path.join(__dirname, "../../src/lib/data.json");

/**
 * Lit le fichier de données JSON
 * @returns {Promise<Object>} Données du fichier JSON
 */
async function readData() {
  try {
    const data = await fs.readFile(DATA_PATH, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.warn("Fichier data.json non trouvé, création structure par défaut");
    return { tasks: [], nextId: 1 };
  }
}

/**
 * Écrit les données dans le fichier JSON
 * @param {Object} data - Données à écrire
 * @returns {Promise<void>}
 */
async function writeData(data) {
  await fs.writeFile(DATA_PATH, JSON.stringify(data, null, 2), "utf8");
}

module.exports = {
  readData,
  writeData,
};
