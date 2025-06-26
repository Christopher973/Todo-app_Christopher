# 🚀 TODO App - Évaluation Qualité & Tests

![CI/CD Pipeline](https://github.com/Christopher973/todoapp_eval_quali-test/workflows/🧪%20Tests%20Pipeline%20-%20Unit%20&%20E2E%20Only/badge.svg)
![Node.js](https://img.shields.io/badge/Node.js-18.x-green)
![Next.js](https://img.shields.io/badge/Next.js-15.3.4-blue)
![Express](https://img.shields.io/badge/Express-4.x-lightgrey)
![Tests](https://img.shields.io/badge/Tests-Jest%20%2B%20Cypress-orange)

> **Application Full-Stack de gestion de tâches (To-Do List)** développée dans le cadre de l'évaluation du module **"Qualité et Tests"** en Master Développement Fullstack.

## 📋 Table des Matières

- [Objectifs du Projet](#-objectifs-du-projet)
- [Fonctionnalités](#-fonctionnalités)
- [Architecture Technique](#️-architecture-technique)
- [Installation](#-installation)
- [Démarrage](#-démarrage)
- [Tests](#-tests)
- [Documentation API](#-documentation-api)
- [API Backend](#-api-backend)
- [Frontend](#-frontend)
- [Tests avec Postman](#-tests-avec-postman)
- [Pipeline CI/CD](#-pipeline-cicd)
- [Métriques de Qualité](#-métriques-de-qualité)

## 🎯 Objectifs du Projet

Cette application répond aux exigences d'évaluation suivantes :

### **Critères d'Évaluation (20 points)**

| Critère                    |     | État                             |
| -------------------------- | --- | -------------------------------- |
| **API REST fonctionnelle** |     | CRUD complet                     |
| **Tests unitaires**        |     | 21 tests (86.66% coverage)       |
| **Tests E2E**              |     | 19 tests Cypress                 |
| **Pipeline CI/CD**         |     | GitHub Actions                   |
| **Documentation Swagger**  |     | Lien accessible depuis le Header |
| **JSDoc**                  |     | Documentation complète           |

### **Spécifications Techniques**

- **API REST** : 4 endpoints CRUD conformes aux spécifications
- **Stockage JSON** : Persistence en fichier local (sans base de données)
- **Tests robustes** : Unitaires (Jest) + E2E (Cypress)
- **CI/CD automatisé** : Pipeline GitHub Actions avec matrice
- **Documentation interactive** : Swagger UI + JSDoc extensive

## ⚡ Fonctionnalités

### **API REST - Gestion des Tâches**

```
POST   /api/tasks      Créer une tâche
GET    /api/tasks      Récupérer toutes les tâches
PUT    /api/tasks/:id  Mettre à jour une tâche
DELETE /api/tasks/:id  Supprimer une tâche
```

### **Interface Web Moderne**

- 🎨 **Design System** : ShadcnUI + TailwindCSS
- ⚡ **État Réactif** : Hooks personnalisés avec gestion d'erreurs
- 🔄 **Synchronisation Temps Réel** : Auto-refresh et health checks
- 📱 **Responsive Design** : Compatible mobile/desktop
- 🛡️ **Gestion d'Erreurs** : Error boundaries et fallbacks

### **Fonctionnalités Métier**

- ✨ Création de tâches avec validation
- 📋 Affichage de la liste avec états de chargement
- ✅ Marquer comme terminé/non terminé
- ✏️ Modification inline des tâches
- 🗑️ Suppression avec confirmation
- 🔍 Gestion des états vides et d'erreur

## 🏗️ Architecture Technique

### **Stack Technologique**

```
Frontend:  Next.js 15.3.4 + React 18.3.1 + TypeScript
UI:        ShadcnUI + TailwindCSS + Framer Motion
Backend:   Express.js + Node.js 18.x
Storage:   JSON File (src/lib/data.json)
Tests:     Jest (unitaires) + Cypress (E2E)
CI/CD:     GitHub Actions
Doc:       Swagger UI + JSDoc
```

### **Structure du Projet**

```
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Layout global avec Navbar
│   ├── page.tsx           # Page d'accueil
│   └── todo/              # Interface TODO
├── src/
│   ├── components/        # Composants réutilisables
│   ├── hooks/            # Hooks personnalisés
│   ├── services/         # Services API
│   ├── types/            # Types TypeScript
│   └── lib/              # Utilitaires + data.json
├── server/               # API Express
│   ├── controllers/      # Logique métier
│   ├── routes/          # Définition des routes
│   ├── middleware/      # Middlewares (CORS, validation, erreurs)
│   ├── utils/           # Utilitaires (storage)
│   ├── config/          # Configuration Swagger
│   ├── docs/            # Schémas OpenAPI
│   └── __tests__/       # Tests unitaires
├── cypress/             # Tests E2E
└── .github/workflows/   # Pipeline CI/CD
```

## 📦 Installation

### **Prérequis**

- **Node.js** : Version 22.x
- **NPM** : Version 8.x
- **Git** : Pour le clonage du dépôt

### **Vérification des Versions**

```bash
node --version    # v22.x
npm --version     # 8.x
```

### **Installation du Projet**

```bash
# 1. Cloner le dépôt
git clone https://github.com/Christopher973/Todo-app_Christopher.git
cd todoapp_eval_quali-test

# 2. Installer les dépendances racine (Next.js)
npm install

# 3. Installer les dépendances backend
cd server
npm install
cd ..

# 4. Créer le fichier de données (si inexistant)
mkdir -p src/lib
echo '{"tasks":[],"nextId":1}' > src/lib/data.json
```

## 🚀 Démarrage

### **Mode Développement (Recommandé)**

```bash
# Démarrage simultané Frontend + Backend
npm run dev

# Accès aux services :
# Frontend : http://localhost:3000
# Backend  : http://localhost:3001
# API Docs : http://localhost:3001/api-docs
```

### **Mode Production**

```bash
# Build de l'application
npm run build

# Démarrage en production
npm run start
```

### **Démarrage Séparé**

```bash
# Terminal 1 - Backend Express
cd server
npm run dev          # Port 3001

# Terminal 2 - Frontend Next.js
npm run dev:next     # Port 3000
```

### **Health Checks**

```bash
# Vérifier le backend
curl http://localhost:3001/health

# Vérifier l'API
curl http://localhost:3001/api/tasks

# Vérifier le frontend
curl http://localhost:3000
```

## 🧪 Tests

### **Tests Unitaires (Jest)**

```bash
# Exécuter tous les tests unitaires
npm run test:unit

# Tests avec coverage
npm run test:coverage

# Tests en mode watch
cd server && npm run test:watch
```

**Résultats attendus :**

```
Test Suites: 4 passed, 4 total
Tests:       21 passed, 21 total
Coverage:    86.66% statements, 83.33% branches
```

### **Tests End-to-End (Cypress)**

```bash
# Interface graphique Cypress
npm run cypress:open

# Exécution headless
npm run cypress:run

# Tests E2E avec serveurs automatiques
npm run test:e2e
```

**Suites de Tests E2E :**

- `task-creation.cy.ts` - Création de tâches
- `task-reading.cy.ts` - Lecture et affichage
- `task-update.cy.ts` - Mise à jour
- `task-deletion.cy.ts` - Suppression

### **Pipeline Complet**

```bash
# Tous les tests (unitaires + E2E)
npm run test:all
```

## 📚 Documentation API

### **Swagger UI Interactif**

- **URL** : [http://localhost:3001/api-docs](http://localhost:3001/api-docs)
- **Fonctionnalités** :
  - Interface interactive pour tester les endpoints
  - Documentation complète des schémas
  - Exemples de requêtes/réponses
  - Validation en temps réel

### **Spécification OpenAPI**

- **Format JSON** : [http://localhost:3001/api-docs.json](http://localhost:3001/api-docs.json)
- **Version** : OpenAPI 3.0.0
- **Conformité** : Schémas validés avec les tests unitaires

## 🔧 API Backend

### **Architecture Express.js**

```javascript
// Structure des middlewares
app.use(helmet()); // Sécurité HTTP
app.use(morgan("combined")); // Logging
app.use(corsMiddleware); // Configuration CORS
app.use(express.json()); // Parsing JSON
app.use("/api", taskRoutes); // Routes API
app.use(errorHandler); // Gestion d'erreurs
```

### **Endpoints Détaillés**

#### **1. Créer une Tâche**

```http
POST http://localhost:3001/api/tasks
Content-Type: application/json

{
  "title": "Ma nouvelle tâche",
  "completed": false
}
```

**Réponse (201) :**

```json
{
  "id": 1,
  "title": "Ma nouvelle tâche",
  "completed": false
}
```

#### **2. Récupérer Toutes les Tâches**

```http
GET http://localhost:3001/api/tasks
```

**Réponse (200) :**

```json
[
  {
    "id": 1,
    "title": "Ma première tâche",
    "completed": false
  },
  {
    "id": 2,
    "title": "Ma seconde tâche",
    "completed": true
  }
]
```

#### **3. Mettre à Jour une Tâche**

```http
PUT http://localhost:3001/api/tasks/1
Content-Type: application/json

{
  "title": "Tâche modifiée",
  "completed": true
}
```

**Réponse (200) :**

```json
{
  "id": 1,
  "title": "Tâche modifiée",
  "completed": true
}
```

#### **4. Supprimer une Tâche**

```http
DELETE http://localhost:3001/api/tasks/1
```

**Réponse (200) :**

```json
{
  "message": "Task deleted successfully"
}
```

### **Validation et Gestion d'Erreurs**

- **Validation express-validator** : Titre (1-200 caractères), completed (boolean)
- **Codes d'erreur standardisés** : 400 (validation), 404 (non trouvé), 500 (serveur)
- **Middleware d'erreurs** : Logging détaillé + réponses formatées

### **Stockage JSON**

```javascript
// Localisation : src/lib/data.json
{
  "tasks": [
    { "id": 1, "title": "Tâche exemple", "completed": false }
  ],
  "nextId": 2
}
```

## 💻 Frontend

### **Architecture Next.js App Router**

```typescript
// Layout Principal
app / layout.tsx; // Navigation + styles globaux

// Pages
app / page.tsx; // Page d'accueil
app / todo / page.tsx; // Interface TODO principale
```

### **Hooks Personnalisés**

```typescript
// Hook principal de gestion d'état
const {
  tasks,
  loading,
  error, // État des données
  createTask,
  updateTask, // Actions CRUD
  deleteTask,
  refetch, // Actions utilitaires
  isCreating,
  isUpdating, // États de mutation
  isDeleting,
  isHealthy, // États de santé
} = useTasksManager();
```

### **Components Réutilisables**

- ✨ **`<TaskForm />`** : Formulaire de création avec validation
- 📋 **`<TaskList />`** : Liste avec skeleton de chargement
- ✅ **`<TaskItem />`** : Item avec actions inline
- 🛡️ **`<ErrorBoundary />`** : Gestion d'erreurs React
- 💚 **`<ApiHealthStatus />`** : Indicateur de santé API

### **Service API TypeScript**

```typescript
// src/services/tasks.service.ts
export class TasksService {
  async getAllTasks(): Promise<Task[]>;
  async createTask(task: CreateTaskRequest): Promise<Task>;
  async updateTask(id: number, task: UpdateTaskRequest): Promise<Task>;
  async deleteTask(id: number): Promise<void>;
}
```

### **Gestion d'État Avancée**

- 🔄 **Auto-refresh** : Synchronisation après chaque action
- 💚 **Health Checks** : Monitoring de disponibilité API
- ⚡ **Optimistic Updates** : Interface réactive
- 🛡️ **Error Recovery** : Retry automatique + fallbacks

## 🔍 Tests avec Postman

### **Collection Postman**

Créer une nouvelle collection `TODO API Tests` avec les requêtes suivantes :

#### **1. Variables d'Environnement**

```javascript
// Créer un environnement "Local Development"
BASE_URL: http://localhost:3001
API_PREFIX: /api
```

#### **2. Health Check**

```http
GET {{BASE_URL}}/health

# Test de Validation :
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Response has status property", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('status', 'healthy');
});
```

#### **3. Récupérer Toutes les Tâches**

```http
GET {{BASE_URL}}{{API_PREFIX}}/tasks

# Tests :
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Response is an array", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData).to.be.an('array');
});
```

#### **4. Créer une Tâche**

```http
POST {{BASE_URL}}{{API_PREFIX}}/tasks
Content-Type: application/json

{
  "title": "Tâche créée avec Postman",
  "completed": false
}

# Tests :
pm.test("Status code is 201", function () {
    pm.response.to.have.status(201);
});

pm.test("Task created successfully", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('id');
    pm.expect(jsonData.title).to.eql("Tâche créée avec Postman");
    pm.expect(jsonData.completed).to.eql(false);

    // Sauvegarder l'ID pour les tests suivants
    pm.environment.set("taskId", jsonData.id);
});
```

#### **5. Mettre à Jour une Tâche**

```http
PUT {{BASE_URL}}{{API_PREFIX}}/tasks/{{taskId}}
Content-Type: application/json

{
  "title": "Tâche modifiée via Postman",
  "completed": true
}

# Tests :
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Task updated successfully", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData.title).to.eql("Tâche modifiée via Postman");
    pm.expect(jsonData.completed).to.eql(true);
});
```

#### **6. Supprimer une Tâche**

```http
DELETE {{BASE_URL}}{{API_PREFIX}}/tasks/{{taskId}}

# Tests :
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Task deleted successfully", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('message');
});
```

#### **7. Tests d'Erreurs**

```http
# Créer une tâche invalide
POST {{BASE_URL}}{{API_PREFIX}}/tasks
Content-Type: application/json

{
  "title": "",
  "completed": "false"
}

# Test :
pm.test("Status code is 400", function () {
    pm.response.to.have.status(400);
});

pm.test("Validation error returned", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('errors');
});
```

### **Ordre d'Exécution Recommandé**

1. **Health Check** - Vérifier que l'API est démarrée
2. **GET /tasks** - État initial
3. **POST /tasks** - Créer une tâche de test
4. **GET /tasks** - Vérifier la création
5. **PUT /tasks/:id** - Modifier la tâche
6. **DELETE /tasks/:id** - Supprimer la tâche
7. **Tests d'erreurs** - Validation des cas limites

## 🚀 Pipeline CI/CD

### **GitHub Actions Workflow**

```yaml
# .github/workflows/ci-cd.yml
name: 🧪 Tests Pipeline - Unit & E2E Only

jobs:
  unit-tests: # Tests unitaires Jest
  build-services: # Build + Health checks
  e2e-tests: # Tests Cypress (matrice)
  test-report: # Rapport final
```

### **Matrice de Tests E2E**

- `task-creation` - Tests de création
- `task-reading` - Tests de lecture
- `task-update` - Tests de mise à jour
- `task-deletion` - Tests de suppression
- `user-workflows` - Workflows utilisateur
- `error-handling` - Gestion d'erreurs
- `crud-operations` - Opérations CRUD complètes

### **Déclencheurs**

- **Push** sur `main` et `develop`
- **Pull Request** vers `main`
- **Workflow manual** (workflow_dispatch)

### **Artéfacts Générés**

- 📊 **Rapports de coverage** (tests unitaires)
- 🎥 **Vidéos Cypress** (en cas d'échec)
- 📸 **Screenshots** (tests E2E échoués)
