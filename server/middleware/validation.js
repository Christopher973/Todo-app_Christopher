const { body, validationResult } = require("express-validator");

/**
 * Validation pour la création de tâche
 */
const validateCreateTask = [
  body("title").notEmpty().withMessage("Le titre est requis"),
  body("completed").isBoolean().withMessage("completed doit être un booléen"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

/**
 * Validation pour la mise à jour de tâche
 */
const validateUpdateTask = [
  body("title")
    .optional()
    .notEmpty()
    .withMessage("Le titre ne peut pas être vide"),
  body("completed")
    .optional()
    .isBoolean()
    .withMessage("completed doit être un booléen"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

module.exports = {
  validateCreateTask,
  validateUpdateTask,
};
