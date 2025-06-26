// server/__tests__/utils/storage.test.js
const fs = require("fs").promises;
const path = require("path");
const { readData, writeData } = require("../../utils/storage");

// Mock du module fs
jest.mock("fs", () => ({
  promises: {
    readFile: jest.fn(),
    writeFile: jest.fn(),
  },
}));

describe("Storage Utils", () => {
  const DATA_PATH = path.join(__dirname, "../../../src/lib/data.json");

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("readData", () => {
    test("should read and parse JSON file successfully", async () => {
      // Arrange
      const mockFileContent = JSON.stringify({
        tasks: [{ id: 1, title: "Test", completed: false }],
        nextId: 2,
      });
      fs.readFile.mockResolvedValue(mockFileContent);

      // Act
      const result = await readData();

      // Assert
      expect(fs.readFile).toHaveBeenCalledWith(DATA_PATH, "utf8");
      expect(result).toEqual({
        tasks: [{ id: 1, title: "Test", completed: false }],
        nextId: 2,
      });
    });

    test("should return default structure when file does not exist", async () => {
      // Arrange
      fs.readFile.mockRejectedValue(new Error("ENOENT: no such file"));

      // Act
      const result = await readData();

      // Assert
      expect(result).toEqual({ tasks: [], nextId: 1 });
    });
  });

  describe("writeData", () => {
    test("should write data to JSON file with formatting", async () => {
      // Arrange
      const testData = {
        tasks: [{ id: 1, title: "Test Task", completed: false }],
        nextId: 2,
      };
      fs.writeFile.mockResolvedValue();

      // Act
      await writeData(testData);

      // Assert
      expect(fs.writeFile).toHaveBeenCalledWith(
        DATA_PATH,
        JSON.stringify(testData, null, 2),
        "utf8"
      );
    });

    test("should handle write errors", async () => {
      // Arrange
      const testData = { tasks: [], nextId: 1 };
      fs.writeFile.mockRejectedValue(new Error("Permission denied"));

      // Act & Assert
      await expect(writeData(testData)).rejects.toThrow(
        "Impossible d'écrire dans le fichier de données"
      );
    });
  });
});
