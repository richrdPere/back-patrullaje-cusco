// TODO:

// GET /api/ocurrencias/:id/formato?formato=pdf
// GET /api/ocurrencias/:id/formato?formato=json
// GET /api/ocurrencias/exportar?formato=csv
// GET /api/ocurrencias/exportar?formato=xlsx
// GET /api/ocurrencias/exportar?formato=json


const express = require('express');

const router = express.Router();

const {

    exportarOcurrenciaController,
   
} = require(
    '../controllers/exportacion.controller',
);

const verificarToken = require(
    '../../../middlewares/verificarToken',
);

router.get(
    '/paginado',
    verificarToken,
    getOcurrenciasPaginadasController,
);

router.get(
    '/exportar',
    verificarToken,
    exportarOcurrenciasController,
);

router.get(
    '/:id/formato',
    verificarToken,
    exportarOcurrenciaController,
);

router.get(
    '/:id',
    verificarToken,
    getOcurrenciaByIdController,
);

router.post(
    '/create',
    verificarToken,
    createOcurrenciaController,
);

module.exports = router;