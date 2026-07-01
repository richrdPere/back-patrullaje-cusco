const createPoliciaService = require('./createPolicia.service');
const getPoliciasService = require('./getPolicias.service');
const getPoliciaByIdService = require('./getPoliciaById.service');
const updatePoliciaService = require('./updatePolicia.service');
const deletePoliciaService = require('./deletePolicia.service');
const getPoliciasAllService = require('./getPoliciasAll.service');

module.exports = {
    createPoliciaService,
    getPoliciasService,
    getPoliciaByIdService,
    updatePoliciaService,
    deletePoliciaService,
    getPoliciasAllService
};