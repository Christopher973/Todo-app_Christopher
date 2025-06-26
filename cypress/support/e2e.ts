// cypress/support/e2e.ts - Configuration globale des tests E2E
import "./commands";

// Configuration globale avant chaque test
beforeEach(() => {
  // Configuration des intercepts communs
  cy.intercept("GET", "/api/tasks").as("getTasks");
  cy.intercept("POST", "/api/tasks").as("createTask");
  cy.intercept("PUT", "/api/tasks/*").as("updateTask");
  cy.intercept("DELETE", "/api/tasks/*").as("deleteTask");
});

// Configuration globale après chaque test
afterEach(() => {
  // Nettoyage si nécessaire
});

// Gestion des erreurs non capturées
Cypress.on("uncaught:exception", (err) => {
  // Ignorer certaines erreurs connues qui n'affectent pas les tests
  if (err.message.includes("ResizeObserver")) {
    return false;
  }
  return true;
});
