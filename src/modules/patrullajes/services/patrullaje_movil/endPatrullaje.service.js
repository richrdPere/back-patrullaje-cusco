const db = require("../../../../database/models");

const {
    PatrullajeProgramado,
    PatrullajePersonal
} = db;

const endPatrullajeService = async (patrullajeId, usuarioId) => {

    // Buscar patrullaje asignado al sereno
    const patrullaje = await PatrullajeProgramado.findByPk(patrullajeId, {
        include: [
            {
                model: PatrullajePersonal,
                as: "personal",
                where: {
                    usuario_id: usuarioId,
                    tipo_personal: "SERENO"
                },
                required: true
            }
        ]
    });

    if (!patrullaje) {
        const error = new Error("Patrullaje no encontrado o no autorizado.");
        error.statusCode = 404;
        throw error;
    }

    if (patrullaje.estado !== "EN_CURSO") {
        const error = new Error("El patrullaje no se encuentra en curso.");
        error.statusCode = 400;
        throw error;
    }

    patrullaje.estado = "FINALIZADO";

    await patrullaje.save();

    return patrullaje;

};

module.exports = endPatrullajeService;