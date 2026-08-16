const express = require("express");
const router = express.Router();

// Middlewares
const authMiddleware = require("../../../middlewares/auth.middleware");
router.use(authMiddleware);

// Controllers
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
router.get("/paginado", getUsuariosController);
router.get("/serenos", getSerenosAndConductoresController);
router.get("/detalle/:id", getUsuarioByIdController);
router.post("/crear", createUsuarioController);
router.put("/editar/:id", updateUsuarioController);
router.patch("/estado/:id", changeEstadoUsuarioController);
router.delete("/eliminar/:id", deleteUsuarioController);

module.exports = router;
