const express = require("express");
const router = express.Router();

// Middleware - multer S3
const upload = require("../../../middlewares/upload-s3");
const verificarToken = require("../../../middlewares/auth.middleware");

const {
    getMyProfileController,
    changePasswordController,
    updateMyProfileController,
    uploadProfilePhotoController
} = require("../controllers/profile.controller");

// ==========================
// RUTAS PERFIL
// ==========================
router.get("/me", verificarToken, getMyProfileController);
router.put("/update", verificarToken, updateMyProfileController);
router.put("/password", verificarToken, changePasswordController);
router.put("/photo", verificarToken, upload.single("foto"), uploadProfilePhotoController);

module.exports = router;