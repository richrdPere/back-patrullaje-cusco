const generarOcurrenciaJson = require("./generateOcurrenciaJson.service");
const generarOcurrenciaPdf = require("./generateOcurrrenciaPdf.service");
const generarOcurrenciasCsvService = require("./generateOcurrenciaCsv.service");
const generarOcurrenciasXlsx = require("./generateOcurrenciasXlsx.service");

module.exports = {
    generarOcurrenciaJson,
    generarOcurrenciaPdf,
    generarOcurrenciasCsvService,
    generarOcurrenciasXlsx,
};