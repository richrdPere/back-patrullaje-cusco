const db = require("../../../../database/models");

// Modelos
const { UnidadPatrullaje } = db;

// Obtener Unidad de Patrullaje por ID
const getUnidadPByIdService = async (id) => {

    const unidad = await UnidadPatrullaje.findByPk(id);

    if (!unidad) {
        throw new Error("Unidad de patrullaje no encontrada.");
    }

    return unidad;

};

module.exports = getUnidadPByIdService;