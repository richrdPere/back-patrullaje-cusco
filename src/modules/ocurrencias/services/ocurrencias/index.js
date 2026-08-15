const crearOcurrenciaService = require("./createOcurrencia.service");
const getOcurrenciaByIdService = require("./getOcurrenciaById.service");
const getOcurrenciasPaginadasService = require("./getOcurrenciasPaginadas.service");
const getOcurrenciasExportablesService = require("./getOcurrenciasExportables.service");

module.exports = {
    crearOcurrenciaService,
    getOcurrenciaByIdService,
    getOcurrenciasExportablesService,
    getOcurrenciasPaginadasService,
}