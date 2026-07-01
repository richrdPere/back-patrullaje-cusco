const db = require("../../../database/models");

const { Zonas } = db;

// ELIMINAR ZONA (LÓGICO)
const deleteZonaService = async (id) => {
    const zona = await Zonas.findByPk(id);
    if (!zona || zona.estado === false) {
        return null;
    }

    await zona.update({
        estado: false
    });

    return true;

};

module.exports = deleteZonaService;