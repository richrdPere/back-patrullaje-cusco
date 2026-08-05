const express = require("express");
const router = express.Router();

// MIDDLEWARES
const authMiddleware = require("../../../middlewares/auth.middleware");
router.use(authMiddleware);

// CONTROLLERS
const {
    getReporteActividadOperativaController,
    getReporteIncidenciasController,
    getReporteRecorridosController,
    getReporteZonasCriticasController,
} = require("../controllers/reportes.controller");

// ROUTES
router.get("/incidencias", getReporteIncidenciasController);
router.get("/actividad-operativa", getReporteActividadOperativaController,);
router.get("/recorridos", getReporteRecorridosController);
router.get("/zonas-criticas", getReporteZonasCriticasController);

module.exports = router;

