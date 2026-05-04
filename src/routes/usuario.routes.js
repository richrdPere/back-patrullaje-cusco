const express = require("express");
const router = express.Router();

const verificarToken = require("../middlewares/auth.middleware");
const verificarRol = require("../middlewares/rol.middleware");

const {
  getUsuariosPaginated,
  getUsuarioById,
  newUsuario,
  updateUsuario,
  changeEstadoUsuario,
  deleteUsuario,
  getSerenosAndConductores
} = require("../controllers/usuario.controller");

// ==========================
// RUTAS USUARIOS
// ==========================
router.get("/paginado", verificarToken, getUsuariosPaginated);
router.get("/serenos", verificarToken, getSerenosAndConductores);
router.get("/detalle/:id", verificarToken, getUsuarioById);
router.post("/crear", verificarToken, newUsuario);
router.put("/editar/:id", verificarToken, updateUsuario);
router.patch("/estado/:id", verificarToken, changeEstadoUsuario);
router.delete("/eliminar/:id", verificarToken, deleteUsuario);


module.exports = router;
