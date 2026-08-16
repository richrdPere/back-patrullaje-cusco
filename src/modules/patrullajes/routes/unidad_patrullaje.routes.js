const express = require('express');
const router = express.Router();

// Middleware
const authMiddleware = require("../../../middlewares/auth.middleware");
router.use(authMiddleware);

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
router.post('/crear', createUnidadPController);
router.get('/codigo', getSiguienteCodigoController);
router.get('/paginado', getUnidadesPController);
router.get('/detalle/:id', getUnidadPByIdController);
router.put('/editar/:id', updateUnidadPController);
router.delete('/eliminar/:id', deleteUnidadPController);
router.get("/todos", getUnidadesPAllController);

module.exports = router;