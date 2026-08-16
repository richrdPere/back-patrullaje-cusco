const express = require("express");
const router = express.Router();

// Middleware
const authMiddleware = require("../../../middlewares/auth.middleware");
router.use(authMiddleware);

// Controllers
const {
  getResumenOperativoController
} = require("../controllers/dashboard.controller");

// ============================
// RUTAS HISTORIAL - DASHBOARD
// ============================
router.get('/resumen', getResumenOperativoController);// verificarToken,

module.exports = router;