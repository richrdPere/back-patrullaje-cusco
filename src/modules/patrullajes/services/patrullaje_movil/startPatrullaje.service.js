const db = require("../../../../database/models");

const {
  PatrullajeProgramado,
  PatrullajePersonal
} = db;

const startPatrullajeService = async (patrullajeId, usuarioId) => {

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

  if (patrullaje.estado !== "PROGRAMADO") {
    const error = new Error("El patrullaje no se encuentra en estado PROGRAMADO.");
    error.statusCode = 400;
    throw error;
  }

  patrullaje.estado = "EN_CURSO";

  await patrullaje.save();

  return patrullaje;
};

module.exports = startPatrullajeService;