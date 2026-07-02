const express = require('express');
const router = express.Router();

// Middleware
const verificarToken = require("../../../middlewares/auth.middleware");

// Controllers
const {
    createUnidadPController,
    getUnidadesPController,
    getUnidadPByIdController,
    updateUnidadPController,
    deleteUnidadPController,
    getSiguienteCodigoController,
    getUnidadesPAllController
} = require('../controllers/unidad_patrullaje.controller');

// ==========================
// RUTAS UNIDAD PATRULLAJE
// ==========================

router.post('/crear', verificarToken, createUnidadPController);
router.get('/codigo', verificarToken, getSiguienteCodigoController);
router.get('/paginado', verificarToken, getUnidadesPController);
router.get('/detalle/:id', verificarToken, getUnidadPByIdController);
router.put('/editar/:id', verificarToken, updateUnidadPController);
router.delete('/eliminar/:id', verificarToken, deleteUnidadPController);
router.get("/todos", verificarToken, getUnidadesPAllController);

module.exports = router;