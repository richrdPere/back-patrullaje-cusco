const express = require('express');
const router = express.Router();

// Middleware
const authMiddleware = require("../../../middlewares/auth.middleware");
router.use(authMiddleware);

// Controllers
const {
    changeEstadoModalidadController,
    getClasificadorArbolController,
    getClasificadorPaginadoController,
    getModalidadByCodigoController,
} = require("../controllers/clasificadores.controller");

// ============================
// RUTAS PATRULLAJES - CLASIFICADOR
// ============================
router.get('/paginado', getClasificadorPaginadoController);
router.get('/arbol', getClasificadorArbolController);
router.get('/codigo/:codigo', getModalidadByCodigoController);
router.patch('/:id/estado', changeEstadoModalidadController,
);

module.exports = router;

