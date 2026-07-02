const db = require("../../../../database/models");

const { UnidadPatrullaje } = db;

const updateUnidadPService = async (id, data) => {

    const unidad = await UnidadPatrullaje.findByPk(id);

    if (!unidad) {
        throw new Error("Unidad de patrullaje no encontrada.");
    }

    const {
        codigo,
        tipo,
        placa,
        descripcion,
        estado
    } = data;

    await unidad.update({
        codigo,
        tipo,
        placa,
        descripcion,
        estado
    });

    return unidad;
};

module.exports = updateUnidadPService;