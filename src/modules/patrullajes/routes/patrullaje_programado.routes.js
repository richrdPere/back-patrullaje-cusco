const express = require("express");
const router = express.Router();

const {
    createPatrullajePController,
    getPatrullajesPController,
    getPatrullajesPAllController,
    getPatrullajePByIdController,
    finishPatrullajePController,
    updatePatrullajePController,
    deletePatrullajePController
} = require("../controllers/patrullaje_programado.controller");

// Middleware
const verificarToken = require("../../../middlewares/auth.middleware");

// ============================
// RUTAS PATRULLAJES PROGRAMADOS
// ============================
router.post("/crear", verificarToken, createPatrullajePController);
router.get("/todos", verificarToken, getPatrullajesPAllController);
router.get("/paginado", verificarToken, getPatrullajesPController);
router.get("/detalle/:id", verificarToken, getPatrullajePByIdController);
router.put("/finalizar/:id", verificarToken, finishPatrullajePController);
router.put("/editar/:id", verificarToken, updatePatrullajePController);
router.delete("/eliminar/:id", verificarToken, deletePatrullajePController);

module.exports = router;
