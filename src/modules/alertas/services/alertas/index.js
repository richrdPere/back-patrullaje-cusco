const createAlertaService = require("./createAlerta.service");
const getAlertaDetalleService = require("./getAlertaDetalle.service");
const getMisAlertasResumenService = require("./getMisAlertasResumen.service");
const getMisAlertasService = require("./getMisAlertas.service");
const marcarAlertaAtendidaService = require("./marcarAlertaAtendida.service");
const responderAlertaService = require("./responderAlerta.service");
const updateRecepcionAlertaService = require("./updateReceptionAlerta.service");
const getAlertasEmitidasService = require("./getAlertasEmitidas.service");
const getAlertaDestinatariosService = require("./getAlertaDestinatarios.service");
const cancelarAlertaService = require("./cancelAlerta.service")

module.exports = {
    createAlertaService,
    getAlertaDetalleService,
    getMisAlertasResumenService,
    getMisAlertasService,
    getAlertasEmitidasService,
    marcarAlertaAtendidaService,
    responderAlertaService,
    updateRecepcionAlertaService,
    getAlertaDestinatariosService,
    cancelarAlertaService

}