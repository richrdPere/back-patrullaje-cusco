const express = require("express");
const router = express.Router();

const verificarToken = require("../middlewares/auth.middleware");
const verificarRol = require("../middlewares/rol.middleware");

const {
  listarUsuarios,
  obtenerUsuarioPorId,
  crearUsuario,
  actualizarUsuario,
  desactivarUsuario,
  activarUsuario,
  eliminarUsuario,
  getSerenosAndConductores
} = require("../controllers/usuario.controller");

// ==========================
// RUTAS USUARIOS
// ==========================

router.get("/", verificarToken, listarUsuarios);
router.get("/serenos", verificarToken, getSerenosAndConductores);
router.get("/:id", verificarToken, obtenerUsuarioPorId);
router.post("/", verificarToken, crearUsuario);
router.put("/:id", verificarToken, actualizarUsuario);
router.patch("/deshabilitar/:id", verificarToken, desactivarUsuario);
router.patch("/habilitar/:id", verificarToken, activarUsuario);
router.delete("/:id", verificarToken, eliminarUsuario);


module.exports = router;
