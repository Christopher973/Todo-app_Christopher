import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:3000",
    viewportWidth: 1280,
    viewportHeight: 720,
    video: false,
    screenshotOnRunFailure: true,

    // Solution propre : supprimer les paramètres inutilisés
    setupNodeEvents() {
      // Configuration des événements et plugins personnalisés
      // Actuellement aucune configuration spécifique requise
    },

    env: {
      API_URL: "http://localhost:3001/api",
    },

    supportFile: "cypress/support/e2e.ts",

    // Timeouts
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,

    // Retry
    retries: {
      runMode: 2,
      openMode: 0,
    },

    // Patterns
    specPattern: "cypress/e2e/**/*.cy.{js,jsx,ts,tsx}",
    excludeSpecPattern: ["cypress/e2e/examples/*"],
  },
});
