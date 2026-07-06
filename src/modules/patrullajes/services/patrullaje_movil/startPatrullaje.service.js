const db = require("../../../../database/models");

const {
  sequelize,
  PatrullajeProgramado,
  PatrullajePersonal
} = db;

const startPatrullajeService = async (patrullajeId, usuarioId) => {

  return await sequelize.transaction(async (t) => {

    const patrullaje = await PatrullajeProgramado.findByPk(
      patrullajeId,
      {
        include: [
          {
            model: PatrullajePersonal,
            as: "personal",
            where: {
              usuario_id: usuarioId,
              tipo_personal: "SERENO",
              estado: "ASIGNADO"
            },
            required: true
          }
        ],
        transaction: t
      }
    );

    if (!patrullaje) {
      const error = new Error(
        "Patrullaje no encontrado o no autorizado."
      );
      error.statusCode = 404;
      throw error;
    }

    if (patrullaje.estado !== "ASIGNADO") {
      const error = new Error(
        "El patrullaje no se encuentra asignado."
      );
      error.statusCode = 400;
      throw error;
    }

    patrullaje.estado = "EN_CURSO";

    await patrullaje.save({
      transaction: t
    });

    await PatrullajePersonal.update(
      {
        estado: "EN_SERVICIO"
      },
      {
        where: {
          patrullaje_id: patrullaje.id,
          usuario_id: usuarioId,
          tipo_personal: "SERENO"
        },
        transaction: t
      }
    );
    return patrullaje;
  });
};

module.exports = startPatrullajeService;