// Timeout global pour les tests asynchrones
jest.setTimeout(10000);

// Mock global optimisé de console.error
const originalError = console.error;
const originalWarn = console.warn;

beforeAll(() => {
  // Mock console.error pour éviter les logs de tests
  console.error = (...args) => {
    // Filtrer les warnings de test
    if (args[0]?.includes && args[0].includes("Warning")) return;
    if (args[0]?.includes && args[0].includes("Erreur lors de")) return;
    originalError.call(console, ...args);
  };

  // Mock console.warn pour les tests storage
  console.warn = (...args) => {
    // Filtrer les warnings normaux des tests
    if (args[0]?.includes && args[0].includes("Fichier data.json non trouvé"))
      return;
    originalWarn.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
  console.warn = originalWarn;
});

// Configuration globale des mocks pour tests asynchrones
beforeEach(() => {
  // Nettoyer tous les mocks avant chaque test
  jest.clearAllMocks();
});
