const express = require("express");
const router = express.Router();

// Middleware
const verificarToken = require("../../../middlewares/auth.middleware");

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
router.post("/crear", verificarToken, createPatrullajePController);
router.get("/todos", verificarToken, getPatrullajesPAllController);
router.get("/paginado", verificarToken, getPatrullajesPController);
router.get("/detalle/:id", verificarToken, getPatrullajePByIdController);
router.put("/finalizar/:id", verificarToken, finishPatrullajePController);
router.put("/editar/:id", verificarToken, updatePatrullajePController);
router.delete("/eliminar/:id", verificarToken, deletePatrullajePController);
router.get("/recorrido/:patrullajeId", verificarToken, getRecorridoPatrullajePController);

module.exports = router;
