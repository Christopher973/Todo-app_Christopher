const express = require("express");
const helmet = require("helmet");
const morgan = require("morgan");

// Import des middleware
const corsMiddleware = require("./middleware/cors");
const errorHandler = require("./middleware/errorHandler");

// Import des routes
const taskRoutes = require("./routes/tasks");

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware de sécurité et logging
app.use(helmet());
app.use(morgan("combined"));

// Middleware CORS
app.use(corsMiddleware);

// Parsing JSON
app.use(express.json());

// Routes API avec préfixe /api
app.use("/api", taskRoutes);

// Route de test fonctionnelle
app.get("/", (req, res) => {
  res.json({
    message: "API TODO - Serveur fonctionnel",
    endpoints: [
      "GET /api/tasks",
      "POST /api/tasks",
      "PUT /api/tasks/:id",
      "DELETE /api/tasks/:id",
    ],
  });
});

// Middleware de gestion d'erreurs (doit être en dernier)
app.use(errorHandler);

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`🚀 Serveur Express démarré sur http://localhost:${PORT}`);
  console.log(
    `📝 Endpoints API disponibles sur http://localhost:${PORT}/api/tasks`
  );
});

module.exports = app;
