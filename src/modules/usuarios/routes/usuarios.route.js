const express = require("express");
const router = express.Router();

// Middlewares
const verificarToken = require("../../../middlewares/auth.middleware");
const verificarRol = require("../../../middlewares/rol.middleware");

const {
    getUsuariosController,
    getUsuarioByIdController,
    createUsuarioController,
    updateUsuarioController,
    changeEstadoUsuarioController,
    deleteUsuarioController,
    getSerenosAndConductoresController
} = require("../controllers/usuarios.controller");

// ==========================
// RUTAS USUARIOS
// ==========================
router.get("/paginado", verificarToken, getUsuariosController);
router.get("/serenos", verificarToken, getSerenosAndConductoresController);
router.get("/detalle/:id", verificarToken, getUsuarioByIdController);
router.post("/crear", verificarToken, createUsuarioController);
router.put("/editar/:id", verificarToken, updateUsuarioController);
router.patch("/estado/:id", verificarToken, changeEstadoUsuarioController);
router.delete("/eliminar/:id", verificarToken, deleteUsuarioController);


module.exports = router;
