const express = require("express");
const router = express.Router();

// Middleware
const authMiddleware = require("../../../middlewares/auth.middleware");
router.use(authMiddleware);

// Controllers
const {
    assignSerenosController,
    getSerenosByUnidadController,
    deleteAsignacionController
} = require("../controllers/unidad_sereno.controller");

// ============================
// RUTAS PATRULLAJES - UNIDAD SERENO
// ============================
router.post("/asignar-serenos", assignSerenosController);
router.get("/unidad/:unidad_id", getSerenosByUnidadController);
router.delete("/unidad/:unidad_id/usuario/:usuario_id", deleteAsignacionController);

module.exports = router;