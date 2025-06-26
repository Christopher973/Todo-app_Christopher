module.exports = {
  root: true, // Empêche l'héritage de la config parent
  env: {
    node: true,
    es2021: true,
  },
  extends: ["eslint:recommended"],
  rules: {
    "no-unused-vars": "warn",
  },
};
