const createHistorialService = require("./createHistorial.service");
const getHistorialByPatrullajeService = require("./getHistorialByPatrullajeId.service");
const getHistorialByIdService = require("./getHistorialById.service");
const updateHistorialService = require("./updateHistorial.service");
const archiveHistorialService = require("./archivarHistorial.service")

module.exports = {
    createHistorialService,
    getHistorialByPatrullajeService,
    getHistorialByIdService,
    updateHistorialService,
    archiveHistorialService
}