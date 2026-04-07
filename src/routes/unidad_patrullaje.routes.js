const express = require('express');
const router = express.Router();


const verificarToken = require("../middlewares/auth.middleware");
const verificarRol = require("../middlewares/rol.middleware");


const {
    crearUnidad,
    obtenerUnidades,
    obtenerUnidadPorId,
    actualizarUnidad,
    eliminarUnidad,
    obtenerSiguienteCodigo,
    getAllUnidades
} = require('../controllers/unidad_patrullaje.controller');

// ==========================
// RUTAS UNIDAD PATRULLAJE
// ==========================

router.post('/crear', verificarToken, crearUnidad);
router.get('/codigo', verificarToken, obtenerSiguienteCodigo);
router.get('/paginado', verificarToken, obtenerUnidades);
router.get('/detalle/:id', verificarToken, obtenerUnidadPorId);
router.put('/editar/:id', verificarToken, actualizarUnidad);
router.delete('/eliminar/:id', verificarToken, eliminarUnidad);
router.get("/todos", verificarToken, getAllUnidades);

module.exports = router;