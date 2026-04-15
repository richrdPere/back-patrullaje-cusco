const express = require("express");
const router = express.Router();

const { getPatrullajeActivoMobile, startPatrullaje, endPatrullaje, sendLocation } = require("../controllers/moviles.controller");
const verificarToken = require("../middlewares/auth.middleware");

// ============================
// RUTAS PATRULLAJES - MOVILES
// ============================
router.get("/patrullaje/activo", verificarToken, getPatrullajeActivoMobile);
router.post('/patrullaje/:id/start', verificarToken, startPatrullaje);
router.post('/patrullaje/:id/end', verificarToken, endPatrullaje);
router.post('/patrullaje/location', verificarToken, sendLocation);

module.exports = router;