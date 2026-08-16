const express = require("express");
const router = express.Router();

// Middleware - multer S3
const authMiddleware = require("../../../middlewares/auth.middleware");
router.use(authMiddleware);

const upload = require("../../../middlewares/upload-s3");

// Controllers
const {
    getMyProfileController,
    changePasswordController,
    updateMyProfileController,
    uploadProfilePhotoController
} = require("../controllers/profile.controller");

// ==========================
// RUTAS PERFIL
// ==========================
router.get("/me", getMyProfileController);
router.put("/update", updateMyProfileController);
router.put("/password", changePasswordController);
router.put("/photo", upload.single("foto"), uploadProfilePhotoController);

module.exports = router;