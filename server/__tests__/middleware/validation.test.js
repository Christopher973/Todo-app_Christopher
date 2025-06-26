jest.mock("express-validator", () => ({
  body: jest.fn(() => ({
    notEmpty: jest.fn().mockReturnThis(),
    withMessage: jest.fn().mockReturnThis(),
    isLength: jest.fn().mockReturnThis(),
    isBoolean: jest.fn().mockReturnThis(),
    optional: jest.fn().mockReturnThis(),
  })),
  validationResult: jest.fn(),
}));

const { validationResult } = require("express-validator");

const {
  validateCreateTask,
  validateUpdateTask,
} = require("../../middleware/validation");

describe("Validation Middleware", () => {
  let req, res, next;

  beforeEach(() => {
    req = { body: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe("validateCreateTask", () => {
    test("should pass validation with valid data", async () => {
      // Arrange
      req.body = { title: "Valid Task", completed: false };
      validationResult.mockReturnValue({ isEmpty: () => true });

      // Act
      const validationHandler =
        validateCreateTask[validateCreateTask.length - 1];
      validationHandler(req, res, next);

      // Assert
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    test("should return 400 with validation errors", async () => {
      // Arrange
      req.body = { title: "", completed: "false" };
      const mockErrors = [
        { msg: "Le titre est requis", path: "title" },
        { msg: "completed doit être un booléen", path: "completed" },
      ];
      validationResult.mockReturnValue({
        isEmpty: () => false,
        array: () => mockErrors,
      });

      // Act
      const validationHandler =
        validateCreateTask[validateCreateTask.length - 1];
      validationHandler(req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ errors: mockErrors });
      expect(next).not.toHaveBeenCalled();
    });
  });
});
