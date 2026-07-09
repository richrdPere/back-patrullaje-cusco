const db = require("../../../../database/models");

// Models
const {
  sequelize,
  PatrullajeProgramado,
  PatrullajePersonal,
  HistorialPatrullaje
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

    // ACTUALIZAR PATRULLAJE
    patrullaje.estado = "EN_CURSO";

    await patrullaje.save({
      transaction: t
    });

    // ACTUALIZAR ASIGNACIÓN
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

    // REGISTRAR HISTORIAL
    await HistorialPatrullaje.create(
      {
        patrullaje_id: patrullaje.id,
        sereno_id: usuarioId,
        zona_id: patrullaje.zona_id,
        tipo: "OBSERVACION",
        titulo: "Inicio del patrullaje",
        descripcion: "El sereno inició el patrullaje programado.",
        prioridad: "BAJA",
        visible_para_siguiente_turno: true
      },
      {
        transaction: t
      }
    );

    return patrullaje;

  });
};

module.exports = startPatrullajeService;