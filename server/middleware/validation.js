/**
 * @fileoverview Middleware de validation des données pour l'API des tâches
 * @description Ce module fournit les middlewares de validation pour les endpoints
 * de création et modification des tâches, utilisant express-validator.
 * @author Votre Nom
 * @version 1.0.0
 * @since 2024
 */

const { body, validationResult } = require("express-validator");

/**
 * @typedef {Object} ValidationError
 * @property {string} type - Type d'erreur de validation
 * @property {string} msg - Message d'erreur
 * @property {string} path - Champ concerné par l'erreur
 * @property {*} value - Valeur qui a causé l'erreur
 */

/**
 * Middleware de validation pour la création de tâches
 * @description Valide les données requises pour créer une nouvelle tâche.
 * Vérifie que le titre est présent et non vide, et que completed est un booléen.
 * @type {Array<Function>}
 * @returns {Array<Function>} Tableau de middlewares de validation
 * @example
 * // Utilisation dans une route:
 * router.post('/tasks', validateCreateTask, createTask);
 *
 * // Données valides:
 * {
 *   "title": "Ma nouvelle tâche",
 *   "completed": false
 * }
 *
 * // Données invalides (génèrera une erreur 400):
 * {
 *   "title": "",           // Titre vide
 *   "completed": "false"   // String au lieu de boolean
 * }
 *
 * // Réponse d'erreur:
 * {
 *   "errors": [
 *     {
 *       "type": "field",
 *       "msg": "Le titre est requis",
 *       "path": "title",
 *       "value": ""
 *     }
 *   ]
 * }
 */
const validateCreateTask = [
  body("title")
    .notEmpty()
    .withMessage("Le titre est requis")
    .isLength({ min: 1, max: 200 })
    .withMessage("Le titre doit contenir entre 1 et 200 caractères"),

  body("completed").isBoolean().withMessage("completed doit être un booléen"),

  /**
   * Middleware de traitement des erreurs de validation
   * @function handleValidationErrors
   * @param {Object} req - Requête Express
   * @param {Object} res - Réponse Express
   * @param {Function} next - Fonction suivante du middleware
   * @returns {void|Object} Passe au middleware suivant ou retourne les erreurs
   */
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

/**
 * Middleware de validation pour la mise à jour de tâches
 * @description Valide les données optionnelles pour modifier une tâche existante.
 * Tous les champs sont optionnels (mise à jour partielle), mais s'ils sont présents,
 * ils doivent respecter les formats requis.
 * @type {Array<Function>}
 * @returns {Array<Function>} Tableau de middlewares de validation
 * @example
 * // Utilisation dans une route:
 * router.put('/tasks/:id', validateUpdateTask, updateTask);
 *
 * // Mise à jour partielle valide (title seulement):
 * {
 *   "title": "Titre modifié"
 * }
 *
 * // Mise à jour partielle valide (completed seulement):
 * {
 *   "completed": true
 * }
 *
 * // Mise à jour complète valide:
 * {
 *   "title": "Nouveau titre",
 *   "completed": true
 * }
 *
 * // Données invalides:
 * {
 *   "title": "",           // Titre vide
 *   "completed": "true"    // String au lieu de boolean
 * }
 */
const validateUpdateTask = [
  body("title")
    .optional()
    .notEmpty()
    .withMessage("Le titre ne peut pas être vide")
    .isLength({ min: 1, max: 200 })
    .withMessage("Le titre doit contenir entre 1 et 200 caractères"),

  body("completed")
    .optional()
    .isBoolean()
    .withMessage("completed doit être un booléen"),

  /**
   * Middleware de traitement des erreurs de validation pour les mises à jour
   * @function handleUpdateValidationErrors
   * @param {Object} req - Requête Express
   * @param {Object} res - Réponse Express
   * @param {Function} next - Fonction suivante du middleware
   * @returns {void|Object} Passe au middleware suivant ou retourne les erreurs
   */
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

/**
 * Export des middlewares de validation
 * @type {Object}
 * @property {Array<Function>} validateCreateTask - Validation pour création
 * @property {Array<Function>} validateUpdateTask - Validation pour mise à jour
 */
module.exports = {
  validateCreateTask,
  validateUpdateTask,
};
