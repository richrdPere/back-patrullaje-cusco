const archiveHistorialService = require("./archivarHistorial.service")
const createHistorialService = require("./createHistorial.service");
const getHistorialByIdService = require("./getHistorialById.service");
const getHistorialByPatrullajeService = require("./getHistorialByPatrullajeId.service");
const getHistorialPaginadoService = require("./getHistorialPaginado.service");
const updateHistorialService = require("./updateHistorial.service");

module.exports = {
    archiveHistorialService,
    createHistorialService,
    getHistorialByIdService,
    getHistorialByPatrullajeService,
    getHistorialPaginadoService,
    updateHistorialService,
}