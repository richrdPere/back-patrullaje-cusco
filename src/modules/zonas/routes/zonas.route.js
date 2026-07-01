const express = require("express");
const router = express.Router();

const {
    createZonaController,
    getZonasController,
    getZonaByIdController,
    updateZonaController,
    deleteZonaController,
} = require("../controllers/zonas.controller");

// Middlewares
const verificarToken = require("../../../middlewares/auth.middleware");

// ============================
// RUTAS ZONAS
// ============================
router.get("/todos", verificarToken, getZonasController);
router.get("/detalle/:id", verificarToken, getZonaByIdController);
router.post("/crear", verificarToken, createZonaController);
router.put("/editar/:id", verificarToken, updateZonaController);
router.delete("/eliminar/:id", verificarToken, deleteZonaController);
// router.get("/todos", verificarToken, getAllUnidades);

module.exports = router;
