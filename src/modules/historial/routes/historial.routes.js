const express = require("express");
const router = express.Router();

// Middleware
const authMiddleware = require("../../../middlewares/auth.middleware");
router.use(authMiddleware);

// Controllers
const {
  archiveHistorialController,
  createHistorialController,
  getHistorialByIdController,
  getHistorialByPatrullajeController,
  getHistorialPaginadoController,
  updateHistorialController,
} = require("../controllers/historial.controller");

// ============================
// RUTAS HISTORIAL - PATRULLAJES
// ============================
router.get("/patrullaje/:id", getHistorialByPatrullajeController);
router.get("/detalle/:id", getHistorialByIdController);
router.post('/crear', createHistorialController);
router.put('/editar/:id', updateHistorialController);
router.patch('/archivar/:id', archiveHistorialController);
router.get("/paginado", getHistorialPaginadoController);

module.exports = router;