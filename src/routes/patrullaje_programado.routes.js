const express = require("express");
const router = express.Router();

const {
    crearPatrullaje,
    listarPatrullajes,
    obtenerPatrullajePorId,
    finalizarPatrullaje,
    updatePatrullaje,
    deletePatrullaje
} = require("../controllers/patrullaje_programado.controller");

const verificarToken = require("../middlewares/auth.middleware");

// ============================
// PATRULLAJES
// ============================

router.post("/crear", verificarToken, crearPatrullaje);
router.get("/todos", verificarToken, listarPatrullajes);
router.get("/detalle/:id", verificarToken, obtenerPatrullajePorId);
router.put("/finalizar/:id", verificarToken, finalizarPatrullaje);
router.put("/editar/:id", verificarToken, updatePatrullaje);
router.delete("/eliminar/:id", verificarToken, deletePatrullaje);

module.exports = router;
