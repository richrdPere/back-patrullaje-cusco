const createPatrullajePService = require("./createPatrullajeP.service");
const getPatrullajesPService = require("./getPatrullajesP.service");
const getPatrullajePByIdService = require("./getPatrullajePById.service");
const getPatrullajesPAllService = require("./getPatrullajesPAll.service");
const finishPatrullajePService = require("./finishPatrullajeP.service");
const updatePatrullajePService = require("./updatePatrullajeP.service");
const deletePatrullajePService = require("./deletePatrullajeP.service");

module.exports = {
    createPatrullajePService,
    getPatrullajesPService,
    getPatrullajePByIdService,
    getPatrullajesPAllService,
    finishPatrullajePService,
    updatePatrullajePService,
    deletePatrullajePService
};