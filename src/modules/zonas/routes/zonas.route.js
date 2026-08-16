const express = require("express");
const router = express.Router();

// Middlewares
const authMiddleware = require("../../../middlewares/auth.middleware");
router.use(authMiddleware);

// Controllers
const {
    createZonaController,
    getZonasController,
    getZonaByIdController,
    updateZonaController,
    deleteZonaController,
} = require("../controllers/zonas.controller");



// ============================
// RUTAS ZONAS
// ============================
router.get("/todos", getZonasController);
router.get("/detalle/:id", getZonaByIdController);
router.post("/crear", createZonaController);
router.put("/editar/:id", updateZonaController);
router.delete("/eliminar/:id", deleteZonaController);
// router.get("/todos", verificarToken, getAllUnidades);

module.exports = router;
