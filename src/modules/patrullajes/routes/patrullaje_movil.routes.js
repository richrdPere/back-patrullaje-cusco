const express = require("express");
const router = express.Router();

// Middleware
const verificarToken = require("../../../middlewares/auth.middleware");

// Controllers
const {
    getPatrullajeActivoController,
    startPatrullajeController,
    endPatrullajeController,
    sendLocationController
} = require("../controllers/patrullaje_movil.controller");

// ============================
// RUTAS PATRULLAJES - MOVILES
// ============================
router.get("/patrullaje/activo", verificarToken, getPatrullajeActivoController);
router.post('/patrullaje/:id/start', verificarToken, startPatrullajeController);
router.post('/patrullaje/:id/end', verificarToken, endPatrullajeController);
router.post('/patrullaje/location', verificarToken, sendLocationController);

module.exports = router;