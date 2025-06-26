// cypress/support/commands.ts - Version corrigée
/// <reference types="cypress" />

/**
 * @fileoverview Commandes Cypress personnalisées pour l'application TODO
 * @description Commandes réutilisables pour les tests E2E, centralisées et typées
 */

// Déclaration globale corrigée avec ESLint disable pour Cypress
/* eslint-disable @typescript-eslint/no-namespace */
declare global {
  namespace Cypress {
    interface Chainable {
      // Navigation
      visitTodoPage(): Chainable<void>;
      waitForAPI(): Chainable<void>;

      // Gestion des tâches via API
      createTaskViaAPI(title: string, completed?: boolean): Chainable<void>;
      cleanupTasks(): Chainable<void>;

      // Gestion des tâches via UI
      createTaskViaUI(title: string): Chainable<void>;

      // Vérifications
      verifyTaskExists(title: string): Chainable<void>;
      verifyTaskCount(count: number): Chainable<void>;
      verifyTaskCompleted(title: string, completed: boolean): Chainable<void>;

      // Utilitaires
      getTaskItem(title: string): Chainable<JQuery<HTMLElement>>;
    }
  }
}
/* eslint-enable @typescript-eslint/no-namespace */

/**
 * Interface pour les réponses API Task
 */
interface TaskResponse {
  id: number;
  title: string;
  completed: boolean;
}

/**
 * Navigation vers la page TODO
 */
Cypress.Commands.add("visitTodoPage", () => {
  cy.visit("/todo");
  // Attendre que la page soit chargée (présence du formulaire ou de l'état vide)
  cy.get('[data-testid="task-form"], [data-testid="empty-state"]', {
    timeout: 10000,
  }).should("be.visible");
});

/**
 * Attend que l'API soit disponible
 */
Cypress.Commands.add("waitForAPI", () => {
  cy.request({
    url: "http://localhost:3001/api/tasks",
    retryOnStatusCodeFailure: true,
    timeout: 10000,
    failOnStatusCode: true,
  }).should((response) => {
    expect(response.status).to.be.oneOf([200, 404]);
  });
});

/**
 * Crée une tâche via l'API (setup rapide)
 */
Cypress.Commands.add(
  "createTaskViaAPI",
  (title: string, completed: boolean = false) => {
    cy.request({
      method: "POST",
      url: "http://localhost:3001/api/tasks",
      body: {
        title,
        completed,
      },
    }).should((response) => {
      expect(response.status).to.eq(201);
      expect(response.body).to.have.property("title", title);
      expect(response.body).to.have.property("completed", completed);
    });
  }
);

/**
 * Nettoie toutes les tâches (setup des tests)
 */
Cypress.Commands.add("cleanupTasks", () => {
  cy.request({
    url: "http://localhost:3001/api/tasks",
    failOnStatusCode: false,
  }).then((response) => {
    if (response.status === 200 && response.body.length > 0) {
      const tasks = response.body as TaskResponse[];
      tasks.forEach((task: TaskResponse) => {
        cy.request({
          method: "DELETE",
          url: `http://localhost:3001/api/tasks/${task.id}`,
          failOnStatusCode: false,
        });
      });
    }
  });
});

/**
 * Crée une tâche via l'interface utilisateur
 */
Cypress.Commands.add("createTaskViaUI", (title: string) => {
  cy.get('[data-testid="task-input"]').clear().type(title);
  cy.get('[data-testid="task-submit"]').click();

  // Attendre que la tâche apparaisse
  cy.get('[data-testid="task-item"]').should("contain", title);
});

/**
 * Vérifie qu'une tâche existe dans la liste
 */
Cypress.Commands.add("verifyTaskExists", (title: string) => {
  cy.get('[data-testid="task-list"]').should("contain", title);
});

/**
 * Vérifie le nombre total de tâches
 */
Cypress.Commands.add("verifyTaskCount", (count: number) => {
  if (count === 0) {
    cy.get('[data-testid="empty-state"]').should("be.visible");
    cy.get('[data-testid="task-item"]').should("not.exist");
  } else {
    cy.get('[data-testid="task-item"]').should("have.length", count);
  }
});

/**
 * Vérifie l'état de completion d'une tâche
 */
Cypress.Commands.add(
  "verifyTaskCompleted",
  (title: string, completed: boolean) => {
    cy.get('[data-testid="task-list"]')
      .contains(title)
      .closest('[data-testid="task-item"]')
      .within(() => {
        if (completed) {
          cy.get('[data-testid="task-title"]').should(
            "have.class",
            "line-through"
          );
        } else {
          cy.get('[data-testid="task-title"]').should(
            "not.have.class",
            "line-through"
          );
        }
      });
  }
);

/**
 * Obtient l'élément d'une tâche spécifique
 */
Cypress.Commands.add("getTaskItem", (title: string) => {
  return cy
    .get('[data-testid="task-list"]')
    .contains(title)
    .closest('[data-testid="task-item"]');
});

export {};
