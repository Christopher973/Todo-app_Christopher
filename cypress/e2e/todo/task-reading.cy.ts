// cypress/e2e/todo/task-reading.cy.ts - Version corrigée
/// <reference types="cypress" />

/**
 * @fileoverview Tests E2E pour la lecture des tâches
 * @description Tests de récupération et affichage des tâches via l'interface utilisateur
 */

interface TaskFixture {
  id: number;
  title: string;
  completed: boolean;
}

interface TasksFixture {
  tasks: TaskFixture[];
  taskData: {
    newTask: TaskFixture;
    completedTask: TaskFixture;
    longTitle: TaskFixture;
  };
}

describe("Todo Reading - Lecture des tâches", () => {
  beforeEach(() => {
    // Nettoyage avant chaque test
    cy.cleanupTasks();
    cy.waitForAPI();
    cy.visitTodoPage();
  });

  afterEach(() => {
    // Nettoyage après chaque test
    cy.cleanupTasks();
  });

  describe("Affichage initial", () => {
    it("devrait afficher l'état vide quand aucune tâche n'existe", () => {
      cy.get('[data-testid="empty-state"]')
        .should("be.visible")
        .and("contain", "Aucune tâche pour le moment");

      cy.get('[data-testid="task-item"]').should("not.exist");
    });

    it("devrait charger et afficher les tâches existantes", () => {
      // ✅ Chargement des fixtures avec typage correct
      cy.fixture<TasksFixture>("tasks").then((tasksData) => {
        const { tasks } = tasksData;

        // Créer des tâches via API
        tasks.forEach((task) => {
          cy.createTaskViaAPI(task.title, task.completed);
        });

        // Recharger la page pour voir les tâches
        cy.visitTodoPage();

        // Vérifier l'affichage
        cy.verifyTaskCount(tasks.length);

        tasks.forEach((task) => {
          cy.verifyTaskExists(task.title);
          cy.verifyTaskCompleted(task.title, task.completed);
        });
      });
    });
  });

  describe("États de chargement", () => {
    it("devrait afficher le skeleton de chargement", () => {
      // Simuler un délai de chargement en interceptant la requête
      cy.intercept("GET", "/api/tasks", {
        delay: 1000,
        body: [],
      }).as("getTasks");

      cy.visitTodoPage();

      // Vérifier l'affichage du skeleton
      cy.get('[data-testid="loading-skeleton"]').should("be.visible");

      cy.wait("@getTasks");

      // Le skeleton devrait disparaître
      cy.get('[data-testid="loading-skeleton"]').should("not.exist");
    });

    it("devrait gérer les erreurs de chargement", () => {
      // Simuler une erreur API
      cy.intercept("GET", "/api/tasks", {
        statusCode: 500,
        body: { error: "Erreur serveur" },
      }).as("getTasksError");

      cy.visitTodoPage();

      cy.wait("@getTasksError");

      // Vérifier l'affichage de l'erreur
      cy.get('[data-testid="error-message"]')
        .should("be.visible")
        .and("contain", "Erreur de chargement");
    });
  });

  describe("Actualisation et synchronisation", () => {
    it("devrait se synchroniser automatiquement après une création", () => {
      cy.fixture<TasksFixture>("tasks").then((tasksData) => {
        const { newTask } = tasksData.taskData;

        // Créer une tâche via l'interface
        cy.createTaskViaUI(newTask.title);

        // Vérifier que la tâche apparaît immédiatement
        cy.verifyTaskExists(newTask.title);
        cy.verifyTaskCount(1);
      });
    });

    it("devrait rafraîchir la liste lors du rechargement de page", () => {
      cy.fixture<TasksFixture>("tasks").then((tasksData) => {
        const { tasks } = tasksData;

        // Créer des tâches via API
        tasks.slice(0, 2).forEach((task) => {
          cy.createTaskViaAPI(task.title, task.completed);
        });

        // Recharger la page
        cy.reload();
        cy.waitForAPI();

        // Vérifier que les tâches sont toujours présentes
        cy.verifyTaskCount(2);
        tasks.slice(0, 2).forEach((task) => {
          cy.verifyTaskExists(task.title);
        });
      });
    });
  });

  describe("Filtrage et tri", () => {
    beforeEach(() => {
      cy.fixture<TasksFixture>("tasks").then((tasksData) => {
        const { tasks } = tasksData;

        // Créer un mix de tâches complétées et non complétées
        tasks.forEach((task) => {
          cy.createTaskViaAPI(task.title, task.completed);
        });

        cy.visitTodoPage();
      });
    });

    it("devrait afficher toutes les tâches par défaut", () => {
      cy.fixture<TasksFixture>("tasks").then((tasksData) => {
        cy.verifyTaskCount(tasksData.tasks.length);
      });
    });

    it("devrait maintenir l'ordre des tâches", () => {
      cy.fixture<TasksFixture>("tasks").then((tasksData) => {
        const { tasks } = tasksData;

        // Vérifier l'ordre d'affichage
        cy.get('[data-testid="task-item"]').each((taskElement, index) => {
          cy.wrap(taskElement).should("contain", tasks[index].title);
        });
      });
    });
  });
});
