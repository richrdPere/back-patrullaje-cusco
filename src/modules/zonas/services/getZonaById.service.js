const db = require("../../../database/models");

// Models
const { Zonas } = db;

// OBTENER ZONA POR ID
const getZonaByIdService = async (id) => {

    const zona = await Zonas.findByPk(id);

    if (!zona || zona.estado === false) {
        return null;
    }

    return zona;

};

module.exports = getZonaByIdService;