const express = require("express");
const router = express.Router();

// Middleware - multer S3
const upload = require("../middlewares/upload-s3");
const verificarToken = require("../middlewares/auth.middleware");
const verificarRol = require("../middlewares/rol.middleware");

const profileController = require("../controllers/profile.controller");

// ==========================
// RUTAS PERFIL
// ==========================
router.get("/me", verificarToken, profileController.getMyProfile);
router.put("/update", verificarToken, profileController.updateMyProfile);
router.put("/password", verificarToken, profileController.changePassword);
router.put("/photo", verificarToken, upload.single("foto"), profileController.uploadProfilePhoto);

module.exports = router;