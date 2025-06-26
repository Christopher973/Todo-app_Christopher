import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:3000",
    viewportWidth: 1280,
    viewportHeight: 720,
    video: true, // ✅ Vidéos pour CI
    screenshotOnRunFailure: true, // ✅ Screenshots en cas d'échec

    setupNodeEvents(on, config) {
      // Configuration pour CI
      if (config.isTextTerminal) {
        config.video = true;
        config.videoCompression = 32;
      }
    },

    env: {
      API_URL: "http://localhost:3001/api",
    },

    // Timeouts pour CI
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,

    // Retry pour stabilité CI
    retries: {
      runMode: 2, // ✅ 2 tentatives en CI
      openMode: 0,
    },

    specPattern: "cypress/e2e/**/*.cy.{js,jsx,ts,tsx}",
  },
});
