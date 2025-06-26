/// <reference types="cypress" />

describe("Todo Creation - Création de tâches", () => {
  beforeEach(() => {
    cy.cleanupTasks();
    cy.waitForAPI();
    cy.visitTodoPage();
  });

  afterEach(() => {
    cy.cleanupTasks();
  });

  describe("Création via interface", () => {
    it("devrait créer une nouvelle tâche avec un titre valide", () => {
      const taskTitle = "Nouvelle tâche de test";

      cy.createTaskViaUI(taskTitle);

      // Vérifications
      cy.verifyTaskExists(taskTitle);
      cy.verifyTaskCount(1);
      cy.verifyTaskCompleted(taskTitle, false); // Nouvelle tâche = non complétée

      // Vérifier que le formulaire est réinitialisé
      cy.get('[data-testid="task-input"]').should("have.value", "");
    });

    it("devrait empêcher la création avec un titre vide", () => {
      cy.get('[data-testid="task-input"]').focus();
      cy.get('[data-testid="task-submit"]').should("be.disabled");

      // Tenter de soumettre sans titre
      cy.get('[data-testid="task-submit"]').click({ force: true });

      // Aucune tâche ne devrait être créée
      cy.verifyTaskCount(0);
    });

    it("devrait gérer les titres longs", () => {
      const longTitle = "a".repeat(200); // Titre à la limite

      cy.get('[data-testid="task-input"]').type(longTitle);
      cy.get('[data-testid="task-submit"]').click();

      cy.verifyTaskExists(longTitle);
    });

    it("devrait afficher une erreur pour un titre trop long", () => {
      const tooLongTitle = "a".repeat(201); // Dépasse la limite

      cy.get('[data-testid="task-input"]').type(tooLongTitle);

      // Vérifier l'affichage de l'erreur de validation
      cy.get('[data-testid="validation-error"]')
        .should("be.visible")
        .and("contain", "Titre trop long");

      cy.get('[data-testid="task-submit"]').should("be.disabled");
    });
  });

  describe("États de chargement et erreurs", () => {
    it("devrait afficher l'état de chargement pendant la création", () => {
      // Intercepter et ralentir la requête de création
      cy.intercept("POST", "/api/tasks", {
        delay: 1000,
        body: { id: 1, title: "Test", completed: false },
      }).as("createTask");

      cy.get('[data-testid="task-input"]').type("Tâche avec délai");
      cy.get('[data-testid="task-submit"]').click();

      // Vérifier l'état de chargement
      cy.get('[data-testid="task-submit"]')
        .should("contain", "Création...")
        .and("be.disabled");

      cy.wait("@createTask");

      // Vérifier le retour à l'état normal
      cy.get('[data-testid="task-submit"]')
        .should("contain", "Ajouter")
        .and("not.be.disabled");
    });

    it("devrait gérer les erreurs de création", () => {
      // Simuler une erreur serveur
      cy.intercept("POST", "/api/tasks", {
        statusCode: 500,
        body: { error: "Erreur serveur" },
      }).as("createTaskError");

      cy.get('[data-testid="task-input"]').type("Tâche avec erreur");
      cy.get('[data-testid="task-submit"]').click();

      cy.wait("@createTaskError");

      // Vérifier l'affichage de l'erreur
      cy.get('[data-testid="error-toast"]')
        .should("be.visible")
        .and("contain", "Erreur");

      // La tâche ne devrait pas être créée
      cy.verifyTaskCount(0);
    });
  });
});
