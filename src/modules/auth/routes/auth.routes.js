const router = require("express").Router();

// Middlewares
const verificarToken = require("../../../middlewares/auth.middleware");

// Controllers
const {
  loginController,
  registerController,
  renewTokenController,
  confirmAccountController,
  recoverAccountController,
  resetPasswordController, } = require("../controllers");

// Validations
const loginValidation = require("../validations/login.validation");
const registerValidation = require("../validations/register.validation");

// ========================
// RUTAS AUTH
// ========================
router.post("/login", loginValidation, loginController);

router.post("/register", registerValidation, registerController);

router.get("/renew-token", verificarToken, renewTokenController);

router.put("/reset-password/:token", resetPasswordController);

router.get("/confirmar/:token", confirmAccountController);

router.post("/recuperar", recoverAccountController);


module.exports = router;