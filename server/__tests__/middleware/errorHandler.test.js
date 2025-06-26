// server/__tests__/middleware/errorHandler.test.js
const errorHandler = require("../../middleware/errorHandler");

describe("Error Handler Middleware", () => {
  let req, res, next;

  beforeEach(() => {
    req = { method: "POST", url: "/api/tasks" };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
    console.error = jest.fn(); // Mock console.error
  });

  test("should handle JSON parse errors", () => {
    // Arrange
    const err = { type: "entity.parse.failed", message: "Invalid JSON" };

    // Act
    errorHandler(err, req, res, next);

    // Assert
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: "JSON invalide",
        code: "INVALID_JSON",
      })
    );
  });

  test("should handle validation errors", () => {
    // Arrange
    const err = { name: "ValidationError", message: "Invalid data" };

    // Act
    errorHandler(err, req, res, next);

    // Assert
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: "Données de requête invalides",
        code: "VALIDATION_ERROR",
      })
    );
  });

  test("should handle generic server errors", () => {
    // Arrange
    const err = new Error("Generic error");

    // Act
    errorHandler(err, req, res, next);

    // Assert
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: "Erreur interne du serveur",
        code: "INTERNAL_ERROR",
      })
    );
  });
});
