const express = require("express");
const router = express.Router();

const {
  registrarGps,
  getUltimaUbicacion,
  getHistorialGps,
  getUltimasUbicaciones,
} = require("../controllers/gps.controller");

const verificarToken = require("../middlewares/auth.middleware");

// ============================
// GPS
// ============================

// Enviado desde móvil
router.post("/", verificarToken, registrarGps);

// Web / monitoreo
router.get("/usuario/:usuario_id", verificarToken, getUltimaUbicacion);
router.get("/historial/:usuario_id", verificarToken, getHistorialGps);
router.get("/ultimas", verificarToken, getUltimasUbicaciones)

module.exports = router;
