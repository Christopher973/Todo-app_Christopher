/// <reference types="cypress" />

describe("Todo Deletion - Suppression de tâches", () => {
  const testTasks = [
    { title: "Tâche à supprimer 1", completed: false },
    { title: "Tâche à supprimer 2", completed: true },
    { title: "Tâche à conserver", completed: false },
  ];

  beforeEach(() => {
    cy.cleanupTasks();
    cy.waitForAPI();

    testTasks.forEach((task) => {
      cy.createTaskViaAPI(task.title, task.completed);
    });

    cy.visitTodoPage();
  });

  afterEach(() => {
    cy.cleanupTasks();
  });

  describe("Suppression avec confirmation", () => {
    it("devrait supprimer une tâche après confirmation", () => {
      const taskToDelete = testTasks[0];

      // Stub de window.confirm pour accepter
      cy.window().then((win) => {
        const confirmStub = cy.stub(win, "confirm").returns(true);
        cy.wrap(confirmStub).as("confirmDialog");
      });

      cy.getTaskItem(taskToDelete.title).within(() => {
        cy.get('[data-testid="task-delete"]').click();
      });

      // Vérifier que la confirmation a été demandée
      cy.get("@confirmDialog").should(
        "have.been.calledWith",
        `Êtes-vous sûr de vouloir supprimer "${taskToDelete.title}" ? Cette action est irréversible.`
      );

      // Vérifier que la tâche est supprimée
      cy.get('[data-testid="task-list"]').should(
        "not.contain",
        taskToDelete.title
      );
      cy.verifyTaskCount(testTasks.length - 1);
    });

    it("devrait annuler la suppression si l'utilisateur refuse", () => {
      const taskToDelete = testTasks[0];
      // Stub de window.confirm pour refuser
      cy.window().then((win) => {
        const confirmStub = cy.stub(win, "confirm").returns(false);
        cy.wrap(confirmStub).as("confirmDialog");
      });

      cy.getTaskItem(taskToDelete.title).within(() => {
        cy.get('[data-testid="task-delete"]').click();
      });

      // Vérifier que la tâche est toujours présente
      cy.verifyTaskExists(taskToDelete.title);
      cy.verifyTaskCount(testTasks.length);
    });
  });

  describe("Suppression multiple", () => {
    it("devrait permettre de supprimer plusieurs tâches", () => {
      // Stub pour accepter toutes les confirmations
      cy.window().then((win) => {
        cy.stub(win, "confirm").returns(true);
      });

      // Supprimer les deux premières tâches
      [testTasks[0], testTasks[1]].forEach((task) => {
        cy.getTaskItem(task.title).within(() => {
          cy.get('[data-testid="task-delete"]').click();
        });
      });

      // Vérifier qu'il ne reste qu'une tâche
      cy.verifyTaskCount(1);
      cy.verifyTaskExists(testTasks[2].title);
    });
  });

  describe("États de chargement et erreurs", () => {
    it("devrait afficher l'état de chargement pendant la suppression", () => {
      cy.intercept("DELETE", "/api/tasks/*", {
        delay: 1000,
        body: { message: "Task deleted successfully" },
      }).as("deleteTask");

      cy.window().then((win) => {
        cy.stub(win, "confirm").returns(true);
      });

      const taskToDelete = testTasks[0];

      cy.getTaskItem(taskToDelete.title).within(() => {
        cy.get('[data-testid="task-delete"]').click();

        // Vérifier l'indicateur de chargement
        cy.get('[data-testid="deleting-indicator"]')
          .should("be.visible")
          .and("contain", "Suppression...");
      });

      cy.wait("@deleteTask");
    });

    it("devrait gérer les erreurs de suppression", () => {
      cy.intercept("DELETE", "/api/tasks/*", {
        statusCode: 500,
        body: { error: "Erreur de suppression" },
      }).as("deleteTaskError");

      cy.window().then((win) => {
        cy.stub(win, "confirm").returns(true);
      });

      const taskToDelete = testTasks[0];

      cy.getTaskItem(taskToDelete.title).within(() => {
        cy.get('[data-testid="task-delete"]').click();
      });

      cy.wait("@deleteTaskError");

      // Vérifier l'affichage de l'erreur
      cy.getTaskItem(taskToDelete.title).within(() => {
        cy.get('[data-testid="error-message"]')
          .should("be.visible")
          .and("contain", "Erreur de suppression");
      });

      // La tâche devrait toujours être présente
      cy.verifyTaskExists(taskToDelete.title);
    });

    it("devrait désactiver les actions pendant la suppression", () => {
      cy.intercept("DELETE", "/api/tasks/*", {
        delay: 2000,
        body: { message: "Task deleted successfully" },
      }).as("deleteTask");

      cy.window().then((win) => {
        cy.stub(win, "confirm").returns(true);
      });

      const taskToDelete = testTasks[0];

      cy.getTaskItem(taskToDelete.title).within(() => {
        cy.get('[data-testid="task-delete"]').click();

        // Vérifier que les boutons sont désactivés
        cy.get('[data-testid="task-edit"]').should("be.disabled");
        cy.get('[data-testid="task-toggle"]').should("be.disabled");
      });

      cy.wait("@deleteTask");
    });
  });

  describe("Suppression et retour à l'état vide", () => {
    it("devrait afficher l'état vide après suppression de toutes les tâches", () => {
      cy.window().then((win) => {
        cy.stub(win, "confirm").returns(true);
      });

      // Supprimer toutes les tâches
      testTasks.forEach((task) => {
        cy.getTaskItem(task.title).within(() => {
          cy.get('[data-testid="task-delete"]').click();
        });
      });

      // Vérifier l'état vide
      cy.get('[data-testid="empty-state"]')
        .should("be.visible")
        .and("contain", "Aucune tâche pour le moment");

      cy.verifyTaskCount(0);
    });
  });
});
