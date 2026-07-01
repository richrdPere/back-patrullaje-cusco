const express = require("express");
const router = express.Router();

const {
    newPatrullajeProgramado,
    getPatrullajesProgramadosPaginated,
    listarPatrullajes,
    getPatrullajeById,
    finalizarPatrullaje,
    updatePatrullaje,
    deletePatrullaje
} = require("../controllers/patrullaje_programado.controller");

const verificarToken = require("../middlewares/auth.middleware");

// ============================
// RUTAS PATRULLAJES PROGRAMADOS
// ============================
router.post("/crear", verificarToken, newPatrullajeProgramado);
router.get("/todos", verificarToken, listarPatrullajes);
router.get("/paginado", verificarToken, getPatrullajesProgramadosPaginated);
router.get("/detalle/:id", verificarToken, getPatrullajeById);
router.put("/finalizar/:id", verificarToken, finalizarPatrullaje);
router.put("/editar/:id", verificarToken, updatePatrullaje);
router.delete("/eliminar/:id", verificarToken, deletePatrullaje);

module.exports = router;
