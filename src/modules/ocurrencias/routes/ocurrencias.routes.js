const express = require('express');
const router = express.Router();

// Middleware
const authMiddleware = require("../../../middlewares/auth.middleware");
router.use(authMiddleware);

// Controllers
const {
    createOcurrenciaController,
    getOcurrenciasPaginadasController,
    getOcurrenciaByIdController,
    exportarOcurrenciaController,
    exportarConsolidadoOcurrenciasController,
} = require("../controllers/ocurrencias.controller");

// ============================
// RUTAS PATRULLAJES - CLASIFICADOR
// ============================
router.post('/create', createOcurrenciaController);
router.get('/paginado', getOcurrenciasPaginadasController);
router.get('/detalle/:id', getOcurrenciaByIdController);
router.get('/exportar', exportarConsolidadoOcurrenciasController);
router.get('/:id/formato', exportarOcurrenciaController);

module.exports = router;

