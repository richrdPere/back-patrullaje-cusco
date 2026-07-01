const db = require("../../../database/models");

// Models
const { Zonas } = db;

// listar zonas
const getZonasService = async () => {

    const zonas = await Zonas.findAll({
        where: { estado: true },
        order: [["createdAt", "DESC"]],
    });

    return zonas;

};

module.exports = getZonasService;