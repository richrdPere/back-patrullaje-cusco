const express = require("express");
const router = express.Router();

const {
    registerHistorial,
    getHistorialByPatrullaje,
    getContextoZona,
    getResumenZona,
    archivarHistorial
} = require("../controllers/historial_patrullaje.controller");

// Middleware JWT
const verificarToken = require("../middlewares/auth.middleware");

// ======================================================
// RUTAS - HISTORIAL PATRULLAJE
// ======================================================
router.post("/", verificarToken, registerHistorial);
router.get("/patrullaje/:patrullajeId", verificarToken, getHistorialByPatrullaje);
router.get("/zona/:zonaId", verificarToken, getContextoZona);
router.get("/zona/:zonaId/resumen", verificarToken, getResumenZona);
router.put("/archivar/:historialId", verificarToken, archivarHistorial);

module.exports = router;