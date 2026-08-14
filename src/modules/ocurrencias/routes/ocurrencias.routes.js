const express = require('express');
const router = express.Router();

// Middleware
const authMiddleware = require("../../../middlewares/auth.middleware");
router.use(authMiddleware);

// Controllers
const {
    createOcurrenciaController,

} = require("../controllers/ocurrencias.controller");

// ============================
// RUTAS PATRULLAJES - CLASIFICADOR
// ============================
router.post('/create', createOcurrenciaController);
// router.get('/arbol', getClasificadorArbolController);
// router.get('/codigo/:codigo', getModalidadByCodigoController);
// router.patch('/:id/estado', changeEstadoModalidadController);

module.exports = router;

