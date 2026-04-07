const express = require("express");
const router = express.Router();

const {
  registrarGps,
  obtenerUltimaUbicacion,
  listarHistorialGps,
} = require("../controllers/gps.controller");

const  verificarToken  = require("../middlewares/auth.middleware");

// ============================
// GPS
// ============================

// Enviado desde móvil
router.post("/", verificarToken, registrarGps);

// Web / monitoreo
router.get("/ultima/:usuarioId", verificarToken, obtenerUltimaUbicacion);
router.get("/historial/:usuarioId", verificarToken, listarHistorialGps);

module.exports = router;
