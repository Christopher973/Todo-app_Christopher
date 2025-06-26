// cypress/e2e/todo/user-workflows.cy.ts - Scénarios utilisateur bout-en-bout
describe("Workflows Utilisateur Complets", () => {
  beforeEach(() => {
    cy.cleanupTasks();
    cy.waitForAPI();
  });

  describe("Scénarios d'utilisation quotidienne", () => {
    it("devrait simuler une session de travail typique", () => {
      cy.visitTodoPage();

      // Utilisateur arrive sur une liste vide
      cy.get('[data-testid="empty-state"]').should("be.visible");

      // Ajoute plusieurs tâches pour sa journée
      const dailyTasks = [
        "Vérifier les emails",
        "Réunion équipe à 10h",
        "Finir le rapport mensuel",
        "Appeler le client",
        "Préparer la présentation",
      ];

      dailyTasks.forEach((task) => {
        cy.createTaskViaUI(task);
      });

      cy.verifyTaskCount(5);

      // Complète quelques tâches au fur et à mesure
      cy.get('[data-testid="task-item"]')
        .contains("Vérifier les emails")
        .parent()
        .find('[data-testid="task-toggle"]')
        .click();

      cy.get('[data-testid="task-item"]')
        .contains("Réunion équipe à 10h")
        .parent()
        .find('[data-testid="task-toggle"]')
        .click();

      // Modifie une tâche pour être plus précise
      cy.get('[data-testid="task-item"]')
        .contains("Appeler le client")
        .parent()
        .find('[data-testid="task-edit"]')
        .click();

      cy.get('[data-testid="edit-input"]')
        .clear()
        .type("Appeler le client - Projet ABC");

      cy.get('[data-testid="save-edit"]').click();

      // Supprime une tâche devenue obsolète
      cy.get('[data-testid="task-item"]')
        .contains("Préparer la présentation")
        .parent()
        .find('[data-testid="task-delete"]')
        .click();

      cy.get('[data-testid="confirm-delete"]').click();

      // Vérifie l'état final
      cy.verifyTaskCount(4);

      // 2 tâches complétées
      cy.get('[data-testid="task-checkbox"]:checked').should("have.length", 2);

      // 2 tâches restantes
      cy.get('[data-testid="task-checkbox"]:not(:checked)').should(
        "have.length",
        2
      );
    });

    it("devrait gérer un workflow de planification hebdomadaire", () => {
      cy.visitTodoPage();

      // Créer des tâches pour la semaine avec des priorités différentes
      const weeklyTasks = [
        { task: "🔴 URGENT: Bug critique en production", priority: "high" },
        { task: "🟡 Révision du code", priority: "medium" },
        { task: "🟢 Lecture documentation", priority: "low" },
        { task: "🔴 Livraison client vendredi", priority: "high" },
        { task: "🟡 Formation équipe", priority: "medium" },
      ];

      weeklyTasks.forEach((item) => {
        cy.createTaskViaUI(item.task);
      });

      // Organiser par priorité - commencer par les tâches urgentes
      cy.get('[data-testid="task-item"]')
        .contains("URGENT: Bug critique")
        .parent()
        .find('[data-testid="task-toggle"]')
        .click();

      // Travailler sur la livraison client
      cy.get('[data-testid="task-item"]')
        .contains("Livraison client")
        .parent()
        .find('[data-testid="task-edit"]')
        .click();

      cy.get('[data-testid="edit-input"]')
        .clear()
        .type("🔴 Livraison client vendredi - 90% terminé");

      cy.get('[data-testid="save-edit"]').click();

      // Compléter une tâche de priorité moyenne
      cy.get('[data-testid="task-item"]')
        .contains("Révision du code")
        .parent()
        .find('[data-testid="task-toggle"]')
        .click();

      // Reporter une tâche à la semaine suivante (supprimer et recréer)
      cy.get('[data-testid="task-item"]')
        .contains("Lecture documentation")
        .parent()
        .find('[data-testid="task-delete"]')
        .click();

      cy.get('[data-testid="confirm-delete"]').click();

      cy.createTaskViaUI("📚 Lecture documentation - Semaine prochaine");

      // Bilan final de la semaine
      cy.verifyTaskCount(5);
      cy.get('[data-testid="task-checkbox"]:checked').should("have.length", 2);
    });
  });

  describe("Scénarios de collaboration d'équipe", () => {
    it("devrait simuler la gestion de tâches partagées", () => {
      cy.visitTodoPage();

      // Créer des tâches assignées à différents membres
      const teamTasks = [
        "👤 Alice: Implémentation API users",
        "👤 Bob: Tests d'intégration",
        "👤 Charlie: Interface utilisateur",
        "👥 Équipe: Code review",
        "👥 Équipe: Déploiement production",
      ];

      teamTasks.forEach((task) => {
        cy.createTaskViaUI(task);
      });

      // Simuler l'avancement des tâches individuelles
      cy.get('[data-testid="task-item"]')
        .contains("Alice: Implémentation")
        .parent()
        .find('[data-testid="task-toggle"]')
        .click();

      cy.get('[data-testid="task-item"]')
        .contains("Bob: Tests")
        .parent()
        .find('[data-testid="task-edit"]')
        .click();

      cy.get('[data-testid="edit-input"]')
        .clear()
        .type("👤 Bob: Tests d'intégration - En cours");

      cy.get('[data-testid="save-edit"]').click();

      // Débloquer les tâches d'équipe une fois les individuelles terminées
      cy.get('[data-testid="task-item"]')
        .contains("Charlie: Interface")
        .parent()
        .find('[data-testid="task-toggle"]')
        .click();

      // Maintenant l'équipe peut faire le code review
      cy.get('[data-testid="task-item"]')
        .contains("Code review")
        .parent()
        .find('[data-testid="task-edit"]')
        .click();

      cy.get('[data-testid="edit-input"]')
        .clear()
        .type("👥 Équipe: Code review - Prêt à commencer");

      cy.get('[data-testid="save-edit"]').click();

      // Vérifier que les dépendances sont respectées
      cy.verifyTaskExists("👥 Équipe: Code review - Prêt à commencer");
      cy.get('[data-testid="task-checkbox"]:checked').should("have.length", 2);
    });
  });

  describe("Scénarios de gestion de projet", () => {
    it("devrait simuler un cycle de développement complet", () => {
      cy.visitTodoPage();

      // Phase 1: Planification
      const planningTasks = [
        "📋 Analyse des besoins",
        "🎨 Maquettes UI/UX",
        "🏗️ Architecture technique",
        "📝 Rédaction spécifications",
      ];

      planningTasks.forEach((task) => {
        cy.createTaskViaUI(task);
      });

      // Terminer la planification
      planningTasks.forEach((task) => {
        cy.get('[data-testid="task-item"]')
          .contains(task.split(" ")[1])
          .parent()
          .find('[data-testid="task-toggle"]')
          .click();
      });

      // Phase 2: Développement
      const devTasks = [
        "⚙️ Configuration environnement",
        "🛠️ Développement backend",
        "💻 Développement frontend",
        "🔗 Intégration APIs",
      ];

      devTasks.forEach((task) => {
        cy.createTaskViaUI(task);
      });

      // Progression du développement
      cy.get('[data-testid="task-item"]')
        .contains("Configuration environnement")
        .parent()
        .find('[data-testid="task-toggle"]')
        .click();

      cy.get('[data-testid="task-item"]')
        .contains("Développement backend")
        .parent()
        .find('[data-testid="task-edit"]')
        .click();

      cy.get('[data-testid="edit-input"]')
        .clear()
        .type("🛠️ Développement backend - 50% terminé");

      cy.get('[data-testid="save-edit"]').click();

      // Phase 3: Tests
      const testTasks = [
        "🧪 Tests unitaires",
        "🔍 Tests d'intégration",
        "👥 Tests utilisateurs",
      ];

      testTasks.forEach((task) => {
        cy.createTaskViaUI(task);
      });

      // Vérifier l'état du projet
      cy.verifyTaskCount(11); // 4 planification + 4 dev + 3 tests

      // 5 tâches terminées (4 planification + 1 config)
      cy.get('[data-testid="task-checkbox"]:checked').should("have.length", 5);
    });

    it("devrait gérer les changements de priorités en cours de projet", () => {
      cy.visitTodoPage();

      // Tâches initiales du sprint
      const sprintTasks = [
        "Feature A - Développement",
        "Feature B - Développement",
        "Bug fix #123",
        "Documentation API",
      ];

      sprintTasks.forEach((task) => {
        cy.createTaskViaUI(task);
      });

      // Début du travail normal
      cy.get('[data-testid="task-item"]')
        .contains("Feature A")
        .parent()
        .find('[data-testid="task-edit"]')
        .click();

      cy.get('[data-testid="edit-input"]')
        .clear()
        .type("Feature A - Développement - En cours");

      cy.get('[data-testid="save-edit"]').click();

      // Changement de priorité urgent
      cy.createTaskViaUI("🚨 HOTFIX: Erreur critique production");

      // Mettre en pause les autres tâches
      cy.get('[data-testid="task-item"]')
        .contains("Feature A - Développement - En cours")
        .parent()
        .find('[data-testid="task-edit"]')
        .click();

      cy.get('[data-testid="edit-input"]')
        .clear()
        .type("Feature A - Développement - EN PAUSE");

      cy.get('[data-testid="save-edit"]').click();

      // Traiter l'urgence
      cy.get('[data-testid="task-item"]')
        .contains("HOTFIX")
        .parent()
        .find('[data-testid="task-toggle"]')
        .click();

      // Reprendre le travail normal
      cy.get('[data-testid="task-item"]')
        .contains("Feature A - Développement - EN PAUSE")
        .parent()
        .find('[data-testid="task-edit"]')
        .click();

      cy.get('[data-testid="edit-input"]')
        .clear()
        .type("Feature A - Développement - Reprise");

      cy.get('[data-testid="save-edit"]').click();

      // Terminer une feature
      cy.get('[data-testid="task-item"]')
        .contains("Feature A - Développement - Reprise")
        .parent()
        .find('[data-testid="task-toggle"]')
        .click();

      // Bilan: 2 tâches terminées (hotfix + feature A)
      cy.get('[data-testid="task-checkbox"]:checked').should("have.length", 2);
    });
  });

  describe("Scénarios de productivité personnelle", () => {
    it("devrait simuler une méthode GTD (Getting Things Done)", () => {
      cy.visitTodoPage();

      // Capture d'idées initiale
      const brainDump = [
        "Idée: Nouveau module reporting",
        "À faire: Mettre à jour CV",
        "Achat: Nouveau clavier",
        "Rappel: Anniversaire collègue",
        "Projet: Refactoring module auth",
      ];

      brainDump.forEach((item) => {
        cy.createTaskViaUI(item);
      });

      // Traitement et organisation
      // Transformer les idées en actions concrètes
      cy.get('[data-testid="task-item"]')
        .contains("Idée: Nouveau module")
        .parent()
        .find('[data-testid="task-edit"]')
        .click();

      cy.get('[data-testid="edit-input"]')
        .clear()
        .type("📋 Planifier: Analyser besoins module reporting");

      cy.get('[data-testid="save-edit"]').click();

      // Actions rapides (moins de 2 minutes)
      cy.get('[data-testid="task-item"]')
        .contains("Rappel: Anniversaire")
        .parent()
        .find('[data-testid="task-toggle"]')
        .click();

      // Déléguer ou planifier
      cy.get('[data-testid="task-item"]')
        .contains("Achat: Nouveau clavier")
        .parent()
        .find('[data-testid="task-edit"]')
        .click();

      cy.get('[data-testid="edit-input"]')
        .clear()
        .type("🛒 Rechercher et commander clavier ergonomique");

      cy.get('[data-testid="save-edit"]').click();

      // Définir les projets
      cy.get('[data-testid="task-item"]')
        .contains("Projet: Refactoring")
        .parent()
        .find('[data-testid="task-edit"]')
        .click();

      cy.get('[data-testid="edit-input"]')
        .clear()
        .type(
          "🏗️ Projet: Créer plan refactoring auth (Prochaine action: Audit code)"
        );

      cy.get('[data-testid="save-edit"]').click();

      // Ajouter les prochaines actions
      cy.createTaskViaUI("📊 Audit du code module auth - 2h");
      cy.createTaskViaUI("📝 Mise à jour CV - sections compétences");

      // Vérifier l'organisation finale
      cy.verifyTaskCount(7);
      cy.get('[data-testid="task-checkbox"]:checked').should("have.length", 1);
    });

    it("devrait gérer la technique Pomodoro", () => {
      cy.visitTodoPage();

      // Préparer les tâches pour des sessions Pomodoro
      const pomodoroTasks = [
        "🍅 Pomodoro 1: Rédaction documentation (25min)",
        "🍅 Pomodoro 2: Code review PR #42 (25min)",
        "🍅 Pomodoro 3: Tests unitaires module X (25min)",
        "🍅 Pomodoro 4: Planification sprint (25min)",
      ];

      pomodoroTasks.forEach((task) => {
        cy.createTaskViaUI(task);
      });

      // Simuler l'exécution des pomodoros
      // Premier pomodoro terminé
      cy.get('[data-testid="task-item"]')
        .contains("Pomodoro 1: Rédaction")
        .parent()
        .find('[data-testid="task-toggle"]')
        .click();

      // Pause de 5 minutes (ajouter rappel)
      cy.createTaskViaUI("☕ Pause 5min après Pomodoro 1");

      // Marquer la pause comme terminée
      cy.get('[data-testid="task-item"]')
        .contains("Pause 5min")
        .parent()
        .find('[data-testid="task-toggle"]')
        .click();

      // Deuxième pomodoro en cours
      cy.get('[data-testid="task-item"]')
        .contains("Pomodoro 2: Code review")
        .parent()
        .find('[data-testid="task-edit"]')
        .click();

      cy.get('[data-testid="edit-input"]')
        .clear()
        .type("🍅 Pomodoro 2: Code review PR #42 - EN COURS");

      cy.get('[data-testid="save-edit"]').click();

      // Interruption urgente
      cy.createTaskViaUI("⚡ Interruption: Appel client urgent");

      // Gérer l'interruption
      cy.get('[data-testid="task-item"]')
        .contains("Pomodoro 2: Code review PR #42 - EN COURS")
        .parent()
        .find('[data-testid="task-edit"]')
        .click();

      cy.get('[data-testid="edit-input"]')
        .clear()
        .type("🍅 Pomodoro 2: Code review PR #42 - INTERROMPU");

      cy.get('[data-testid="save-edit"]').click();

      cy.get('[data-testid="task-item"]')
        .contains("Interruption: Appel client")
        .parent()
        .find('[data-testid="task-toggle"]')
        .click();

      // Reprendre le pomodoro
      cy.get('[data-testid="task-item"]')
        .contains("Pomodoro 2: Code review PR #42 - INTERROMPU")
        .parent()
        .find('[data-testid="task-edit"]')
        .click();

      cy.get('[data-testid="edit-input"]')
        .clear()
        .type("🍅 Pomodoro 2: Code review PR #42 - REPRIS");

      cy.get('[data-testid="save-edit"]').click();

      // Vérifier le tracking des pomodoros
      cy.verifyTaskCount(6);
      cy.get('[data-testid="task-checkbox"]:checked').should("have.length", 2);
    });
  });

  describe("Scénarios d'accessibilité", () => {
    it("devrait permettre une navigation complète au clavier", () => {
      cy.visitTodoPage();

      // Créer une tâche avec le clavier
      cy.get("body").tab(); // Focus sur le premier élément
      cy.get('[data-testid="task-input"]').should("be.focused");

      cy.get('[data-testid="task-input"]').type("Tâche créée au clavier");

      cy.get("body").tab(); // Aller au bouton submit
      cy.get('[data-testid="task-submit"]').should("be.focused");

      cy.get('[data-testid="task-submit"]').type("{enter}");

      cy.verifyTaskExists("Tâche créée au clavier");

      // Naviguer dans la liste des tâches
      cy.get("body").tab(); // Premier bouton de la tâche
      cy.get('[data-testid="task-toggle"]').should("be.focused");

      cy.get("body").tab(); // Bouton edit
      cy.get('[data-testid="task-edit"]').should("be.focused");

      cy.get("body").tab(); // Bouton delete
      cy.get('[data-testid="task-delete"]').should("be.focused");

      // Éditer avec le clavier
      cy.get('[data-testid="task-edit"]').type("{enter}");
      cy.get('[data-testid="edit-input"]').should("be.focused");

      cy.get('[data-testid="edit-input"]')
        .clear()
        .type("Tâche modifiée au clavier");

      cy.get("body").tab(); // Aller au bouton save
      cy.get('[data-testid="save-edit"]').type("{enter}");

      cy.verifyTaskExists("Tâche modifiée au clavier");
    });

    it("devrait fournir un feedback approprié pour les lecteurs d'écran", () => {
      cy.visitTodoPage();

      // Vérifier les attributs aria-label
      cy.get('[data-testid="task-input"]')
        .should("have.attr", "aria-label")
        .and("contain", "Nouveau titre de tâche");

      cy.get('[data-testid="task-submit"]')
        .should("have.attr", "aria-label")
        .and("contain", "Ajouter la tâche");

      // Créer une tâche et vérifier les attributs
      cy.createTaskViaUI("Tâche pour test accessibilité");

      cy.get('[data-testid="task-toggle"]')
        .should("have.attr", "aria-label")
        .and("contain", "Marquer comme complétée");

      cy.get('[data-testid="task-edit"]')
        .should("have.attr", "aria-label")
        .and("contain", "Modifier la tâche");

      cy.get('[data-testid="task-delete"]')
        .should("have.attr", "aria-label")
        .and("contain", "Supprimer la tâche");

      // Tester les changements d'état
      cy.get('[data-testid="task-toggle"]').click();

      cy.get('[data-testid="task-toggle"]')
        .should("have.attr", "aria-label")
        .and("contain", "Marquer comme non complétée");
    });
  });

  describe("Scénarios de persistance et synchronisation", () => {
    it("devrait maintenir l'état lors de rechargements de page", () => {
      cy.visitTodoPage();

      // Créer un état complexe
      cy.createTaskViaUI("Tâche persistante 1");
      cy.createTaskViaUI("Tâche persistante 2");
      cy.createTaskViaUI("Tâche persistante 3");

      // Modifier les états
      cy.get('[data-testid="task-item"]')
        .first()
        .find('[data-testid="task-toggle"]')
        .click();

      cy.get('[data-testid="task-item"]')
        .contains("Tâche persistante 2")
        .parent()
        .find('[data-testid="task-edit"]')
        .click();

      cy.get('[data-testid="edit-input"]')
        .clear()
        .type("Tâche persistante 2 - Modifiée");

      cy.get('[data-testid="save-edit"]').click();

      // Recharger la page
      cy.reload();
      cy.waitForAPI();

      // Vérifier que l'état est maintenu
      cy.verifyTaskCount(3);
      cy.verifyTaskExists("Tâche persistante 1");
      cy.verifyTaskExists("Tâche persistante 2 - Modifiée");
      cy.verifyTaskExists("Tâche persistante 3");

      // Vérifier l'état de completion
      cy.get('[data-testid="task-item"]')
        .contains("Tâche persistante 1")
        .parent()
        .find('[data-testid="task-checkbox"]')
        .should("be.checked");
    });

    it("devrait gérer les conflits de synchronisation", () => {
      cy.visitTodoPage();

      // Créer une tâche
      cy.createTaskViaUI("Tâche de synchronisation");

      // Simuler une modification côté serveur (autre utilisateur/onglet)
      cy.intercept("GET", "/api/tasks", {
        fixture: "tasks.json",
      }).as("syncUpdate");

      // Déclencher une synchronisation
      cy.reload();
      cy.wait("@syncUpdate");

      // Vérifier que les changements sont reflétés
      // (Dépend de l'implémentation de la gestion des conflits)
    });
  });
});
