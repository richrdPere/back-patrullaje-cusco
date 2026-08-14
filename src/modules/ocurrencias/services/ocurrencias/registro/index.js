const registrarEfectivosPnp = require("./registrarEfectivosPnp.service");
const registrarResultadoMedios = require("./registrarResultadoMedios.service");
const relacionarIncidenciaOcurrencia = require("./relacionarIncidenciaOcurrencia.service");
const registrarPersonasOcurrencia = require("./registrarPersonaOcurrencia.service");

module.exports = {
    registrarEfectivosPnp,
    registrarPersonasOcurrencia,
    registrarResultadoMedios,
    relacionarIncidenciaOcurrencia,
}