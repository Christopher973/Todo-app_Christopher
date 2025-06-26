// .eslintrc.cypress.js - Configuration ESLint spécifique pour Cypress
module.exports = {
  extends: [
    "../.eslintrc.js", // Hériter de la config principale
  ],
  env: {
    "cypress/globals": true,
  },
  plugins: ["cypress"],
  rules: {
    // ✅ Désactiver les règles problématiques pour Cypress
    "@typescript-eslint/no-namespace": "off", // Nécessaire pour les types globaux Cypress
    "@typescript-eslint/no-explicit-any": "error", // Maintenir la strictesse TypeScript
    "cypress/no-unnecessary-waiting": "error",
    "cypress/assertion-before-screenshot": "warn",
    "cypress/no-force": "warn",
    "cypress/no-async-tests": "error",
  },
  overrides: [
    {
      files: ["cypress/support/commands.ts"],
      rules: {
        "@typescript-eslint/no-namespace": "off", // Exception spécifique pour les commandes
      },
    },
  ],
};
