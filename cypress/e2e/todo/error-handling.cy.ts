// cypress/e2e/todo/error-handling.cy.ts - Tests de gestion d'erreurs avancée
describe("Gestion d'Erreurs Avancée", () => {
  beforeEach(() => {
    cy.cleanupTasks();
    cy.waitForAPI();
  });

  describe("Erreurs de connexion API", () => {
    it("devrait gérer l'indisponibilité de l'API lors du chargement", () => {
      // Simuler une erreur réseau
      cy.intercept("GET", "/api/tasks", { forceNetworkError: true }).as(
        "getTasksError"
      );

      cy.visit("/todo");

      // Vérifier l'affichage du statut d'erreur
      cy.wait("@getTasksError");
      cy.get('[data-testid="api-health-status"]')
        .should("be.visible")
        .and("contain", "API indisponible");

      // Vérifier la présence du bouton de retry
      cy.get('[data-testid="retry-button"]').should("be.visible");

      // Simuler la récupération de l'API
      cy.intercept("GET", "/api/tasks", { fixture: "api-responses.json" }).as(
        "getTasksSuccess"
      );

      // Cliquer sur retry
      cy.get('[data-testid="retry-button"]').click();

      cy.wait("@getTasksSuccess");
      cy.get('[data-testid="api-health-status"]').should(
        "contain",
        "API disponible"
      );
    });

    it("devrait gérer les erreurs 500 du serveur", () => {
      cy.intercept("GET", "/api/tasks", {
        statusCode: 500,
        body: { error: "Erreur interne du serveur" },
      }).as("getTasksServerError");

      cy.visit("/todo");

      cy.wait("@getTasksServerError");
      cy.get('[data-testid="error-message"]')
        .should("be.visible")
        .and("contain", "Erreur serveur");

      cy.get('[data-testid="retry-button"]').should("be.visible");
    });

    it("devrait gérer les timeouts d'API", () => {
      cy.intercept("GET", "/api/tasks", { delay: 30000 }).as("getTasksTimeout");

      cy.visit("/todo");

      // Vérifier l'indicateur de chargement prolongé
      cy.get('[data-testid="loading-skeleton"]').should("be.visible");

      // Simuler un timeout (Cypress a un timeout par défaut)
      // On peut aussi tester avec un délai plus court et un timeout custom
    });
  });

  describe("Erreurs de création de tâches", () => {
    beforeEach(() => {
      cy.visitTodoPage();
    });

    it("devrait gérer l'échec de création d'une tâche", () => {
      // Simuler une erreur lors de la création
      cy.intercept("POST", "/api/tasks", {
        statusCode: 400,
        body: { error: "Données invalides" },
      }).as("createTaskError");

      cy.get('[data-testid="task-input"]').type("Tâche qui va échouer");
      cy.get('[data-testid="task-submit"]').click();

      cy.wait("@createTaskError");

      // Vérifier l'affichage de l'erreur
      cy.get('[data-testid="error-toast"]')
        .should("be.visible")
        .and("contain", "Erreur lors de la création");

      // Vérifier que le formulaire garde la valeur
      cy.get('[data-testid="task-input"]').should(
        "have.value",
        "Tâche qui va échouer"
      );

      // Vérifier que la tâche n'a pas été ajoutée
      cy.get('[data-testid="task-item"]').should("not.exist");
    });

    it("devrait valider les données côté client", () => {
      // Tenter de créer une tâche vide
      cy.get('[data-testid="task-submit"]').click();

      // Le bouton devrait être désactivé ou ne rien faire
      cy.get('[data-testid="task-submit"]').should("be.disabled");

      // Tester avec des espaces uniquement
      cy.get('[data-testid="task-input"]').type("   ");
      cy.get('[data-testid="task-submit"]').should("be.disabled");

      // Tester avec une tâche trop longue
      const longTitle = "a".repeat(300);
      cy.get('[data-testid="task-input"]').clear().type(longTitle);

      cy.get('[data-testid="validation-error"]')
        .should("be.visible")
        .and("contain", "Titre trop long");
    });

    it("devrait gérer les erreurs de réseau lors de la création", () => {
      cy.intercept("POST", "/api/tasks", { forceNetworkError: true }).as(
        "createTaskNetworkError"
      );

      cy.get('[data-testid="task-input"]').type("Tâche réseau");
      cy.get('[data-testid="task-submit"]').click();

      cy.wait("@createTaskNetworkError");

      cy.get('[data-testid="error-toast"]')
        .should("be.visible")
        .and("contain", "Problème de connexion");

      // Vérifier la possibilité de retry
      cy.get('[data-testid="retry-creation"]').should("be.visible");
    });
  });

  describe("Erreurs de modification de tâches", () => {
    beforeEach(() => {
      cy.createTaskViaAPI("Tâche à modifier", false);
      cy.visitTodoPage();
    });

    it("devrait gérer l'échec de modification d'une tâche", () => {
      cy.intercept("PUT", "/api/tasks/*", {
        statusCode: 404,
        body: { error: "Tâche non trouvée" },
      }).as("updateTaskError");

      // Commencer l'édition
      cy.get('[data-testid="task-edit"]').click();
      cy.get('[data-testid="edit-input"]').clear().type("Titre modifié");
      cy.get('[data-testid="save-edit"]').click();

      cy.wait("@updateTaskError");

      // Vérifier l'affichage de l'erreur
      cy.get('[data-testid="error-toast"]')
        .should("be.visible")
        .and("contain", "Erreur lors de la modification");

      // Vérifier que le mode édition reste actif
      cy.get('[data-testid="edit-input"]').should("be.visible");
    });

    it("devrait gérer l'échec de toggle du statut", () => {
      cy.intercept("PATCH", "/api/tasks/*/toggle", {
        statusCode: 500,
        body: { error: "Erreur serveur" },
      }).as("toggleTaskError");

      cy.get('[data-testid="task-toggle"]').click();

      cy.wait("@toggleTaskError");

      // Vérifier que l'état n'a pas changé
      cy.get('[data-testid="task-checkbox"]').should("not.be.checked");

      cy.get('[data-testid="error-toast"]')
        .should("be.visible")
        .and("contain", "Erreur lors de la mise à jour");
    });

    it("devrait valider les modifications côté client", () => {
      cy.get('[data-testid="task-edit"]').click();

      // Tenter de sauvegarder un titre vide
      cy.get('[data-testid="edit-input"]').clear();
      cy.get('[data-testid="save-edit"]').should("be.disabled");

      // Tester avec des espaces uniquement
      cy.get('[data-testid="edit-input"]').type("   ");
      cy.get('[data-testid="save-edit"]').should("be.disabled");

      // Annuler devrait restaurer le titre original
      cy.get('[data-testid="cancel-edit"]').click();
      cy.get('[data-testid="task-title"]').should(
        "contain",
        "Tâche à modifier"
      );
    });
  });

  describe("Erreurs de suppression de tâches", () => {
    beforeEach(() => {
      cy.createTaskViaAPI("Tâche à supprimer", false);
      cy.visitTodoPage();
    });

    it("devrait gérer l'échec de suppression d'une tâche", () => {
      cy.intercept("DELETE", "/api/tasks/*", {
        statusCode: 404,
        body: { error: "Tâche non trouvée" },
      }).as("deleteTaskError");

      cy.get('[data-testid="task-delete"]').click();
      cy.get('[data-testid="confirm-delete"]').click();

      cy.wait("@deleteTaskError");

      // Vérifier l'affichage de l'erreur
      cy.get('[data-testid="error-toast"]')
        .should("be.visible")
        .and("contain", "Erreur lors de la suppression");

      // Vérifier que la tâche est toujours présente
      cy.get('[data-testid="task-item"]').should("exist");
      cy.verifyTaskExists("Tâche à supprimer");
    });

    it("devrait gérer les erreurs réseau lors de la suppression", () => {
      cy.intercept("DELETE", "/api/tasks/*", { forceNetworkError: true }).as(
        "deleteTaskNetworkError"
      );

      cy.get('[data-testid="task-delete"]').click();
      cy.get('[data-testid="confirm-delete"]').click();

      cy.wait("@deleteTaskNetworkError");

      cy.get('[data-testid="error-toast"]')
        .should("be.visible")
        .and("contain", "Problème de connexion");

      // La tâche devrait rester visible
      cy.verifyTaskExists("Tâche à supprimer");
    });
  });

  describe("Récupération d'erreurs et resilience", () => {
    it("devrait récupérer automatiquement après une perte de connexion", () => {
      cy.visitTodoPage();

      // Simuler une perte de connexion
      cy.intercept("GET", "/api/tasks", { forceNetworkError: true }).as(
        "connectionLost"
      );

      cy.reload();
      cy.wait("@connectionLost");

      cy.get('[data-testid="api-health-status"]').should(
        "contain",
        "API indisponible"
      );

      // Simuler le retour de la connexion
      cy.intercept("GET", "/api/tasks", { fixture: "api-responses.json" }).as(
        "connectionRestored"
      );

      // Le système devrait retry automatiquement ou permettre un retry manuel
      cy.get('[data-testid="retry-button"]').click();

      cy.wait("@connectionRestored");
      cy.get('[data-testid="api-health-status"]').should(
        "contain",
        "API disponible"
      );
    });

    it("devrait maintenir l'état de l'interface pendant les erreurs temporaires", () => {
      cy.visitTodoPage();

      // Créer une tâche avec succès
      cy.createTaskViaUI("Tâche avant erreur");

      // Simuler une erreur temporaire pour les nouvelles créations
      cy.intercept("POST", "/api/tasks", {
        statusCode: 503,
        body: { error: "Service temporairement indisponible" },
      }).as("temporaryError");

      // Tenter de créer une autre tâche
      cy.get('[data-testid="task-input"]').type("Tâche pendant erreur");
      cy.get('[data-testid="task-submit"]').click();

      cy.wait("@temporaryError");

      // Vérifier que la première tâche est toujours visible
      cy.verifyTaskExists("Tâche avant erreur");

      // Vérifier l'affichage de l'erreur pour la nouvelle tâche
      cy.get('[data-testid="error-toast"]').should("be.visible");

      // Restaurer le service
      cy.intercept("POST", "/api/tasks", { statusCode: 201 }).as(
        "serviceRestored"
      );

      // Retry de création
      cy.get('[data-testid="task-submit"]').click();

      cy.wait("@serviceRestored");

      // Vérifier que les deux tâches sont maintenant présentes
      cy.verifyTaskExists("Tâche avant erreur");
      cy.verifyTaskExists("Tâche pendant erreur");
    });
  });

  describe("Accessibilité lors des erreurs", () => {
    it("devrait annoncer les erreurs aux lecteurs d'écran", () => {
      cy.visitTodoPage();

      cy.intercept("POST", "/api/tasks", {
        statusCode: 400,
        body: { error: "Erreur de validation" },
      }).as("validationError");

      cy.get('[data-testid="task-input"]').type("Tâche erreur");
      cy.get('[data-testid="task-submit"]').click();

      cy.wait("@validationError");

      // Vérifier les attributs d'accessibilité
      cy.get('[data-testid="error-toast"]')
        .should("have.attr", "role", "alert")
        .and("have.attr", "aria-live", "polite");

      // Vérifier que le focus est géré correctement
      cy.get('[data-testid="task-input"]').should("be.focused");
    });

    it("devrait permettre la navigation au clavier pendant les erreurs", () => {
      cy.visitTodoPage();

      cy.intercept("GET", "/api/tasks", { forceNetworkError: true }).as(
        "loadError"
      );

      cy.reload();
      cy.wait("@loadError");

      // Naviguer au clavier vers le bouton retry
      cy.get("body").tab();
      cy.get('[data-testid="retry-button"]').should("be.focused");

      // Activer le retry avec Entrée
      cy.get('[data-testid="retry-button"]').type("{enter}");
    });
  });
});
