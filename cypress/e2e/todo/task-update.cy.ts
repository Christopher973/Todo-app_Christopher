/// <reference types="cypress" />

describe("Todo Update - Mise à jour de tâches", () => {
  const testTask = {
    title: "Tâche à modifier",
    completed: false,
  };

  beforeEach(() => {
    cy.cleanupTasks();
    cy.waitForAPI();
    cy.createTaskViaAPI(testTask.title, testTask.completed);
    cy.visitTodoPage();
  });

  afterEach(() => {
    cy.cleanupTasks();
  });

  describe("Modification du titre", () => {
    it("devrait permettre de modifier le titre d'une tâche", () => {
      const newTitle = "Titre modifié";

      cy.getTaskItem(testTask.title).within(() => {
        cy.get('[data-testid="task-edit"]').click();
        cy.get('[data-testid="edit-input"]')
          .clear()
          .type(newTitle)
          .type("{enter}");
      });

      // Vérifier la modification
      cy.verifyTaskExists(newTitle);
      cy.get('[data-testid="task-list"]').should("not.contain", testTask.title);
    });

    it("devrait annuler la modification avec Escape", () => {
      cy.getTaskItem(testTask.title).within(() => {
        cy.get('[data-testid="task-edit"]').click();
        cy.get('[data-testid="edit-input"]')
          .clear()
          .type("Modification annulée")
          .type("{esc}");
      });

      // Le titre original devrait être conservé
      cy.verifyTaskExists(testTask.title);
    });

    it("devrait empêcher la sauvegarde d'un titre vide", () => {
      cy.getTaskItem(testTask.title).within(() => {
        cy.get('[data-testid="task-edit"]').click();
        cy.get('[data-testid="edit-input"]').clear().type("{enter}");
      });

      // Le titre original devrait être conservé
      cy.verifyTaskExists(testTask.title);
    });
  });

  describe("Modification du statut", () => {
    it("devrait basculer le statut de completion", () => {
      cy.getTaskItem(testTask.title).within(() => {
        cy.get('[data-testid="task-toggle"]').click();
      });

      // Vérifier que la tâche est maintenant complétée
      cy.verifyTaskCompleted(testTask.title, true);
    });

    it("devrait basculer de complété à non complété", () => {
      // D'abord marquer comme complété
      cy.getTaskItem(testTask.title).within(() => {
        cy.get('[data-testid="task-toggle"]').click();
      });

      cy.verifyTaskCompleted(testTask.title, true);

      // Puis basculer vers non complété
      cy.getTaskItem(testTask.title).within(() => {
        cy.get('[data-testid="task-toggle"]').click();
      });

      cy.verifyTaskCompleted(testTask.title, false);
    });
  });

  describe("États de chargement et erreurs", () => {
    it("devrait afficher l'état de chargement pendant la mise à jour", () => {
      cy.intercept("PUT", "/api/tasks/*", {
        delay: 1000,
        body: { id: 1, title: "Titre modifié", completed: false },
      }).as("updateTask");

      cy.getTaskItem(testTask.title).within(() => {
        cy.get('[data-testid="task-edit"]').click();
        cy.get('[data-testid="edit-input"]')
          .clear()
          .type("Nouveau titre")
          .type("{enter}");

        // Vérifier l'indicateur de chargement
        cy.get('[data-testid="updating-indicator"]')
          .should("be.visible")
          .and("contain", "Mise à jour...");
      });

      cy.wait("@updateTask");
    });

    it("devrait gérer les erreurs de mise à jour", () => {
      cy.intercept("PUT", "/api/tasks/*", {
        statusCode: 500,
        body: { error: "Erreur de mise à jour" },
      }).as("updateTaskError");

      cy.getTaskItem(testTask.title).within(() => {
        cy.get('[data-testid="task-toggle"]').click();
      });

      cy.wait("@updateTaskError");

      // Vérifier l'affichage de l'erreur
      cy.getTaskItem(testTask.title).within(() => {
        cy.get('[data-testid="error-message"]')
          .should("be.visible")
          .and("contain", "Erreur de mise à jour");
      });
    });
  });
});
