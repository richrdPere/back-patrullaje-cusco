const express = require("express");
const router = express.Router();

// Middleware
const authMiddleware = require("../../../middlewares/auth.middleware");
router.use(authMiddleware);

// Controllers
const {
    createPatrullajePController,
    deletePatrullajePController,
    finishPatrullajePController,
    getPatrullajePByIdController,
    getPatrullajesPAllController,
    getPatrullajesPController,
    getRecorridoPatrullajePController,
    updatePatrullajePController,
} = require("../controllers/patrullaje_programado.controller");

// ============================
// RUTAS PATRULLAJES PROGRAMADOS
// ============================
router.post("/crear", createPatrullajePController);
router.get("/todos", getPatrullajesPAllController);
router.get("/paginado", getPatrullajesPController);
router.get("/detalle/:id", getPatrullajePByIdController);
router.put("/finalizar/:id", finishPatrullajePController);
router.put("/editar/:id", updatePatrullajePController);
router.delete("/eliminar/:id", deletePatrullajePController);
router.get("/recorrido/:patrullajeId", getRecorridoPatrullajePController);

module.exports = router;
