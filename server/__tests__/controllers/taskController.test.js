// server/__tests__/controllers/taskController.test.js
const {
  getAllTasks,
  createTask,
  updateTask,
  deleteTask,
} = require("../../controllers/taskController");
const { readData, writeData } = require("../../utils/storage");

// Mock du module storage
jest.mock("../../utils/storage");

describe("getAllTasks Controller", () => {
  let req, res;

  beforeEach(() => {
    req = {};
    res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };
    jest.clearAllMocks();
  });

  test("should return array of tasks when storage contains data", async () => {
    // Arrange - Mock de readData avec données
    const mockData = {
      tasks: [
        { id: 1, title: "Test Task 1", completed: false },
        { id: 2, title: "Test Task 2", completed: true },
      ],
      nextId: 3,
    };
    readData.mockResolvedValue(mockData);

    // Act - Appel de la fonction
    await getAllTasks(req, res);

    // Assert - Vérifications
    expect(readData).toHaveBeenCalledTimes(1);
    expect(res.json).toHaveBeenCalledWith(mockData.tasks);
    expect(res.status).not.toHaveBeenCalled();
  });

  test("should return empty array when no tasks exist", async () => {
    // Arrange - Mock de readData sans tâches
    const mockData = { tasks: [], nextId: 1 };
    readData.mockResolvedValue(mockData);

    // Act
    await getAllTasks(req, res);

    // Assert
    expect(res.json).toHaveBeenCalledWith([]);
  });

  test("should return 500 error when storage fails", async () => {
    // Arrange - Mock d'erreur de lecture
    const mockError = new Error("File read error");
    readData.mockRejectedValue(mockError);

    // Act
    await getAllTasks(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: "Erreur lors de la récupération des tâches",
    });
  });
});

describe("createTask Controller", () => {
  let req, res;

  beforeEach(() => {
    req = {};
    res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };
    jest.clearAllMocks();
  });

  test("should create task with valid data", async () => {
    // Arrange
    req.body = { title: "New Task", completed: false };
    const mockData = { tasks: [], nextId: 1 };
    readData.mockResolvedValue(mockData);
    writeData.mockResolvedValue();

    // Act
    await createTask(req, res);

    // Assert
    expect(writeData).toHaveBeenCalledWith({
      tasks: [{ id: 1, title: "New Task", completed: false }],
      nextId: 2,
    });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      id: 1,
      title: "New Task",
      completed: false,
    });
  });

  test("should return 400 error with empty title", async () => {
    // Arrange
    req.body = { title: "", completed: false };

    // Act
    await createTask(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Données invalides" });
    expect(readData).not.toHaveBeenCalled();
  });

  test("should return 400 error with invalid completed type", async () => {
    // Arrange
    req.body = { title: "Valid Title", completed: "false" };

    // Act
    await createTask(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Données invalides" });
  });

  test("should return 500 error when storage write fails", async () => {
    // Arrange
    req.body = { title: "Valid Task", completed: true };
    readData.mockResolvedValue({ tasks: [], nextId: 1 });
    writeData.mockRejectedValue(new Error("Write error"));

    // Act
    await createTask(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: "Erreur lors de la création de la tâche",
    });
  });
});

describe("updateTask Controller", () => {
  let req, res;

  beforeEach(() => {
    req = { params: {}, body: {} };
    res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };
    jest.clearAllMocks();
  });

  test("should update existing task with valid data", async () => {
    // Arrange
    req.params.id = "1";
    req.body = { title: "Updated Task", completed: true };
    const mockData = {
      tasks: [{ id: 1, title: "Original Task", completed: false }],
      nextId: 2,
    };
    readData.mockResolvedValue(mockData);
    writeData.mockResolvedValue();

    // Act
    await updateTask(req, res);

    // Assert
    expect(writeData).toHaveBeenCalledWith({
      tasks: [{ id: 1, title: "Updated Task", completed: true }],
      nextId: 2,
    });
    expect(res.json).toHaveBeenCalledWith({
      id: 1,
      title: "Updated Task",
      completed: true,
    });
  });

  test("should update task partially (title only)", async () => {
    // Arrange
    req.params.id = "1";
    req.body = { title: "New Title" };
    const mockData = {
      tasks: [{ id: 1, title: "Old Title", completed: true }],
      nextId: 2,
    };
    readData.mockResolvedValue(mockData);
    writeData.mockResolvedValue();

    // Act
    await updateTask(req, res);

    // Assert
    expect(res.json).toHaveBeenCalledWith({
      id: 1,
      title: "New Title",
      completed: true,
    });
  });

  test("should return 404 when task not found", async () => {
    // Arrange
    req.params.id = "999";
    req.body = { title: "Updated" };
    readData.mockResolvedValue({ tasks: [], nextId: 1 });

    // Act
    await updateTask(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: "Tâche non trouvée" });
    expect(writeData).not.toHaveBeenCalled();
  });
});

describe("deleteTask Controller", () => {
  let req, res;

  beforeEach(() => {
    req = { params: {} };
    res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };
    jest.clearAllMocks();
  });

  test("should delete existing task", async () => {
    // Arrange
    req.params.id = "1";
    const mockData = {
      tasks: [
        { id: 1, title: "Task to delete", completed: false },
        { id: 2, title: "Task to keep", completed: true },
      ],
      nextId: 3,
    };
    readData.mockResolvedValue(mockData);
    writeData.mockResolvedValue();

    // Act
    await deleteTask(req, res);

    // Assert
    expect(writeData).toHaveBeenCalledWith({
      tasks: [{ id: 2, title: "Task to keep", completed: true }],
      nextId: 3,
    });
    expect(res.json).toHaveBeenCalledWith({
      message: "Task deleted successfully",
    });
  });

  test("should return 404 when task not found", async () => {
    // Arrange
    req.params.id = "999";
    readData.mockResolvedValue({ tasks: [], nextId: 1 });

    // Act
    await deleteTask(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: "Tâche non trouvée" });
    expect(writeData).not.toHaveBeenCalled();
  });
});
