const express = require("express");
const router = express.Router();

// Middleware
const authMiddleware = require("../../../middlewares/auth.middleware");
router.use(authMiddleware);

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
router.get("/patrullaje/activo", getPatrullajeActivoController);
router.post('/patrullaje/:id/start', startPatrullajeController);
router.post('/patrullaje/:id/end', endPatrullajeController);
router.post('/patrullaje/location', sendLocationController);

module.exports = router;