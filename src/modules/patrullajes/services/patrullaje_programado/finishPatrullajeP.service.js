const db = require("../../../../database/models");

const {
    PatrullajeProgramado
} = db;

// Finalizar Patrullaje Programado
const finishPatrullajePService = async (id) => {

    const patrullaje =
        await PatrullajeProgramado.findByPk(id);

    if (!patrullaje) {
        throw new Error("Patrullaje no encontrado.");
    }

    patrullaje.estado = "FINALIZADO";

    // Solo si existe el campo en el modelo
    if ("fecha_fin" in patrullaje.dataValues) {
        patrullaje.fecha_fin = new Date();
    }

    await patrullaje.save();

    return {
        id: patrullaje.id,
        estado: patrullaje.estado
    };

};

module.exports = finishPatrullajePService;