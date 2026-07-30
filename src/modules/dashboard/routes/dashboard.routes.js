const express = require("express");
const router = express.Router();

// Middleware
const verificarToken = require("../../../middlewares/auth.middleware");

// Controllers
const {
  getResumenOperativoController
} = require("../controllers/dashboard.controller");

// ============================
// RUTAS HISTORIAL - DASHBOARD
// ============================
router.get('/resumen',  getResumenOperativoController);// verificarToken,

module.exports = router;