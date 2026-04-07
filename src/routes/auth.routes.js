const express = require("express");
const router = express.Router();
const verificarToken = require("../middlewares/auth.middleware");

const { login, confirmarCuenta, recuperarCuenta, resetPassword, register, renewToken } = require("../controllers/auth.controller");


// ========================
// RUTAS AUTH
// ========================
router.post("/login", login);

router.get("/confirmar/:token", confirmarCuenta);

router.post("/recuperar", recuperarCuenta);

router.put("/reset-password/:token", resetPassword);

router.post("/register", register);

router.get("/renew", verificarToken, renewToken);

module.exports = router;