// services/ocurrencias/clasificador/index.js

const changeEstadoModalidadService = require('./changeEstadoModalidad.service');
const getClasificadorArbolService = require('./getClasificadorArbol.service');
const getModalidadByCodigoService = require('./getModalidadByCodigo.service');
const getModalidadesPaginadasService = require('./getModalidadPaginadas.service');

module.exports = {
    changeEstadoModalidadService,
    getClasificadorArbolService,
    getModalidadByCodigoService,
    getModalidadesPaginadasService,
};