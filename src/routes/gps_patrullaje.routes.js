const express = require("express");
const router = express.Router();

const {
    registrarGpsPatrulla,
    getUltimaUbicacionPatrulla,
    getHistorialPatrulla,
    getUltimasUbicacionesPatrullas
} = require("../controllers/patrullaje_gps.controller");

const verificarToken = require("../middlewares/auth.middleware");

// ============================
// GPS
// ============================

// Enviado desde móvil
router.post("/", verificarToken, registrarGpsPatrulla);

// Web / monitoreo
router.get("/patrullaje/:patrullaje_id", verificarToken, getUltimaUbicacionPatrulla);
router.get("/historial/:patrullaje_id", verificarToken, getHistorialPatrulla);
router.get("/ultimas", verificarToken, getUltimasUbicacionesPatrullas)

module.exports = router;
