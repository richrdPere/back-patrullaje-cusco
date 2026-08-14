
const validarReferenciasOcurrencia = require("./referencias_ocurrencias.validate");
const validarModalidadActiva = require("./modalidad_activa.validate");
const validarDatosOcurrencia = require("./datos_ocurrencia.validate");

module.exports = {
    validarDatosOcurrencia,
    validarModalidadActiva,
    validarReferenciasOcurrencia,
}