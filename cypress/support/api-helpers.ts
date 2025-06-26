// cypress/support/api-helpers.ts - Utilitaires pour les interactions API
/// <reference types="cypress" />

/**
 * @fileoverview Helpers pour les tests API
 * @description Fonctions utilitaires pour interagir avec l'API dans les tests
 */

interface Task {
  id: number;
  title: string;
  completed: boolean;
}

/**
 * Nettoie toutes les données de test de l'API
 */
export const cleanupAllTasks = (): void => {
  cy.request({
    url: "http://localhost:3001/api/tasks",
    failOnStatusCode: false,
  }).then((response) => {
    if (response.status === 200 && Array.isArray(response.body)) {
      response.body.forEach((task: Task) => {
        cy.request({
          method: "DELETE",
          url: `http://localhost:3001/api/tasks/${task.id}`,
          failOnStatusCode: false,
        });
      });
    }
  });
};

/**
 * Crée plusieurs tâches via l'API
 */
export const createMultipleTasks = (
  tasks: Array<{ title: string; completed: boolean }>
): void => {
  tasks.forEach((task) => {
    cy.request({
      method: "POST",
      url: "http://localhost:3001/api/tasks",
      body: task,
    });
  });
};

/**
 * Vérifie l'état de santé de l'API
 */
export const checkApiHealth = (): Cypress.Chainable<boolean> => {
  return cy
    .request({
      url: "http://localhost:3001/api/tasks",
      failOnStatusCode: false,
      timeout: 5000,
    })
    .then((response) => {
      return response.status === 200 || response.status === 404;
    });
};
