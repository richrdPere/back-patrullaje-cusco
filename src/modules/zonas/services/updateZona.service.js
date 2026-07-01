const db = require("../../../database/models");

// Models
const { Zonas } = db;


// ACTUALIZAR ZONA
const updateZonaService = async (id, data) => {

    const zona = await Zonas.findByPk(id);

    if (!zona || zona.estado === false) {
        return null;
    }

    await zona.update({
        nombre: data.nombre,
        descripcion: data.descripcion,
        coordenadas: data.coordenadas,
        riesgo: data.riesgo
    });

    return zona;

};

module.exports = updateZonaService;