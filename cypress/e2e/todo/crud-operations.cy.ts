// cypress/e2e/todo/crud-operations.cy.ts - Tests intégrés CRUD
describe("Opérations CRUD Intégrées", () => {
  beforeEach(() => {
    cy.cleanupTasks();
    cy.waitForAPI();
    cy.visitTodoPage();
  });

  describe("Workflow CRUD complet", () => {
    it("devrait permettre de créer, lire, modifier et supprimer une tâche", () => {
      const originalTitle = "Tâche pour test CRUD";
      const updatedTitle = "Tâche modifiée";

      // CREATE - Créer une tâche
      cy.createTaskViaUI(originalTitle);
      cy.verifyTaskExists(originalTitle);
      cy.verifyTaskCount(1);

      // READ - Vérifier que la tâche est visible et non complétée
      cy.get('[data-testid="task-item"]')
        .contains(originalTitle)
        .parent()
        .as("taskItem");

      cy.get("@taskItem")
        .find('[data-testid="task-checkbox"]')
        .should("not.be.checked");

      cy.get("@taskItem")
        .find('[data-testid="task-title"]')
        .should("not.have.class", "line-through");

      // UPDATE 1 - Marquer comme complétée
      cy.get("@taskItem").find('[data-testid="task-toggle"]').click();

      cy.get("@taskItem")
        .find('[data-testid="task-checkbox"]')
        .should("be.checked");

      cy.get("@taskItem")
        .find('[data-testid="task-title"]')
        .should("have.class", "line-through");

      // UPDATE 2 - Modifier le titre
      cy.get("@taskItem").find('[data-testid="task-edit"]').click();

      cy.get('[data-testid="edit-input"]').clear().type(updatedTitle);

      cy.get('[data-testid="save-edit"]').click();

      // Vérifier la modification
      cy.verifyTaskExists(updatedTitle);
      cy.get('[data-testid="task-item"]').should("not.contain", originalTitle);

      // DELETE - Supprimer la tâche
      cy.get('[data-testid="task-item"]')
        .contains(updatedTitle)
        .parent()
        .find('[data-testid="task-delete"]')
        .click();

      cy.get('[data-testid="confirm-delete"]').click();

      // Vérifier la suppression
      cy.verifyTaskCount(0);
      cy.get('[data-testid="empty-state"]').should("be.visible");
    });

    it("devrait gérer plusieurs tâches avec différents états", () => {
      const tasks = [
        { title: "Tâche 1 - Non complétée", completed: false },
        { title: "Tâche 2 - Complétée", completed: true },
        { title: "Tâche 3 - À modifier", completed: false },
      ];

      // Créer toutes les tâches
      tasks.forEach((task) => {
        cy.createTaskViaUI(task.title);
        if (task.completed) {
          cy.get('[data-testid="task-item"]')
            .contains(task.title)
            .parent()
            .find('[data-testid="task-toggle"]')
            .click();
        }
      });

      cy.verifyTaskCount(3);

      // Vérifier les états
      cy.get('[data-testid="task-item"]')
        .contains("Tâche 1")
        .parent()
        .find('[data-testid="task-checkbox"]')
        .should("not.be.checked");

      cy.get('[data-testid="task-item"]')
        .contains("Tâche 2")
        .parent()
        .find('[data-testid="task-checkbox"]')
        .should("be.checked");

      // Modifier la troisième tâche
      cy.get('[data-testid="task-item"]')
        .contains("Tâche 3")
        .parent()
        .find('[data-testid="task-edit"]')
        .click();

      cy.get('[data-testid="edit-input"]').clear().type("Tâche 3 - Modifiée");

      cy.get('[data-testid="save-edit"]').click();

      cy.verifyTaskExists("Tâche 3 - Modifiée");

      // Supprimer toutes les tâches une par une
      [
        "Tâche 1 - Non complétée",
        "Tâche 2 - Complétée",
        "Tâche 3 - Modifiée",
      ].forEach((title, index) => {
        cy.get('[data-testid="task-item"]')
          .contains(title)
          .parent()
          .find('[data-testid="task-delete"]')
          .click();

        cy.get('[data-testid="confirm-delete"]').click();

        cy.verifyTaskCount(2 - index);
      });

      cy.get('[data-testid="empty-state"]').should("be.visible");
    });
  });

  describe("Opérations en lot", () => {
    beforeEach(() => {
      // Créer plusieurs tâches pour les tests en lot
      cy.fixture("tasks").then((data) => {
        data.validTasks.forEach(
          (task: { title: string; completed: boolean }, index: number) => {
            cy.createTaskViaAPI(`${task.title} ${index}`, false);
          }
        );
      });
    });

    it("devrait permettre de marquer plusieurs tâches comme complétées", () => {
      cy.visitTodoPage();

      // Marquer toutes les tâches comme complétées
      cy.get('[data-testid="task-toggle"]').each(($toggle) => {
        cy.wrap($toggle).click();
      });

      // Vérifier que toutes sont complétées
      cy.get('[data-testid="task-checkbox"]').each(($checkbox) => {
        cy.wrap($checkbox).should("be.checked");
      });

      cy.get('[data-testid="task-title"]').each(($title) => {
        cy.wrap($title).should("have.class", "line-through");
      });
    });

    it("devrait permettre de supprimer toutes les tâches", () => {
      cy.visitTodoPage();

      // Compter les tâches initialement
      cy.get('[data-testid="task-item"]').then(($items) => {
        const initialCount = $items.length;

        // Supprimer toutes les tâches
        for (let i = initialCount - 1; i >= 0; i--) {
          cy.get('[data-testid="task-item"]')
            .first()
            .find('[data-testid="task-delete"]')
            .click();

          cy.get('[data-testid="confirm-delete"]').click();

          if (i > 0) {
            cy.verifyTaskCount(i);
          }
        }

        // Vérifier l'état vide final
        cy.verifyTaskCount(0);
        cy.get('[data-testid="empty-state"]').should("be.visible");
      });
    });
  });

  describe("Persistance des données", () => {
    it("devrait persister les modifications après rechargement de page", () => {
      const taskTitle = "Tâche persistante";

      // Créer et modifier une tâche
      cy.createTaskViaUI(taskTitle);
      cy.get('[data-testid="task-toggle"]').first().click();

      // Recharger la page
      cy.reload();
      cy.waitForAPI();

      // Vérifier que la tâche et son état sont persistés
      cy.verifyTaskExists(taskTitle);
      cy.get('[data-testid="task-checkbox"]').should("be.checked");
      cy.get('[data-testid="task-title"]').should("have.class", "line-through");
    });

    it("devrait maintenir l'ordre des tâches après modification", () => {
      const tasks = ["Première", "Deuxième", "Troisième"];

      // Créer les tâches dans l'ordre
      tasks.forEach((title) => {
        cy.createTaskViaUI(title);
      });

      // Modifier la tâche du milieu
      cy.get('[data-testid="task-item"]')
        .contains("Deuxième")
        .parent()
        .find('[data-testid="task-edit"]')
        .click();

      cy.get('[data-testid="edit-input"]').clear().type("Deuxième modifiée");

      cy.get('[data-testid="save-edit"]').click();

      // Vérifier l'ordre après modification
      cy.get('[data-testid="task-title"]').then(($titles) => {
        expect($titles.eq(0)).to.contain("Première");
        expect($titles.eq(1)).to.contain("Deuxième modifiée");
        expect($titles.eq(2)).to.contain("Troisième");
      });
    });
  });
});
