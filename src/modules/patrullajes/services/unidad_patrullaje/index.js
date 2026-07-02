const createUnidadPService = require('./createUnidadP.service');
const getUnidadesPService = require("./getUnidadesP.service");
const getUnidadPByIdService = require("./getUnidadPById.service");
const updateUnidadPService = require("./updateUnidadP.service");
const deleteUnidadPService = require("./deleteUnidadP.service");
const getCodigoUnidadPService = require("./getCodigoUnidadP.service");
const getUnidadesPAllService = require("./getUnidadPatrullajeAll.service")

module.exports = {
    createUnidadPService,
    getUnidadesPService,
    getUnidadPByIdService,
    updateUnidadPService,
    deleteUnidadPService,
    getCodigoUnidadPService,
    getUnidadesPAllService
};