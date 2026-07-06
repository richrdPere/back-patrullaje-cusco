const express = require("express");
const router = express.Router();

// Middleware
const verificarToken = require("../../../middlewares/auth.middleware");

// Controllers
const {
    createHistorialController,
    getHistorialByPatrullajeController,
    getHistorialByIdController,
    updateHistorialController,
    archiveHistorialController
} = require("../controllers/historial.controller");

// ============================
// RUTAS HISTORIAL - PATRULLAJES
// ============================
router.get("/patrullaje/:id", verificarToken, getHistorialByPatrullajeController);
router.get("/detalle/:id", verificarToken, getHistorialByIdController);
router.post('/crear', verificarToken, createHistorialController);
router.put('/editar/:id', verificarToken, updateHistorialController);
router.patch('/archivar/:id', verificarToken, archiveHistorialController);

module.exports = router;