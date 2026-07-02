const db = require("../../../../database/models");

// Modelos
const { UnidadPatrullaje } = db;

const deleteUnidadPService = async (id) => {

    const unidad =
        await UnidadPatrullaje.findByPk(id);

    if (!unidad) {
        throw new Error(
            "Unidad de patrullaje no encontrada."
        );
    }

    await unidad.destroy();

    return true;

}

module.exports = deleteUnidadPService;