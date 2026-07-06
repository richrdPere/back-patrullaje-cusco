const db = require("../../../database/models");

const {
  sequelize,
  HistorialPatrullaje,
  PatrullajeProgramado,
  PatrullajePersonal
} = db;

const createHistorialService = async (usuarioId, data) => {

  const {
    patrullaje_id,
    zona_id,
    tipo,
    titulo,
    descripcion,
    prioridad,
    latitud,
    longitud,
    visible_para_siguiente_turno
  } = data;

  return await sequelize.transaction(async (t) => {

    // ==========================
    // VALIDAR PATRULLAJE
    // ==========================
    const patrullaje = await PatrullajeProgramado.findByPk(
      patrullaje_id,
      { transaction: t }
    );

    if (!patrullaje) {
      const error = new Error("El patrullaje no existe.");
      error.statusCode = 404;
      throw error;
    }

    if (patrullaje.estado !== "EN_CURSO") {
      const error = new Error("Solo se puede registrar historial en patrullajes en curso.");
      error.statusCode = 400;
      throw error;
    }

    // ==========================
    // VALIDAR ASIGNACIÓN
    // ==========================
    const asignacion = await PatrullajePersonal.findOne({

      where: {
        patrullaje_id,
        usuario_id: usuarioId,
        tipo_personal: "SERENO",
        estado: "EN_SERVICIO"
      },

      transaction: t

    });

    if (!asignacion) {
      const error = new Error("No perteneces a este patrullaje.");
      error.statusCode = 403;
      throw error;
    }

    // ==========================
    // CREAR HISTORIAL
    // ==========================
    const historial = await HistorialPatrullaje.create({
      patrullaje_id,
      sereno_id: usuarioId,
      zona_id,
      tipo,
      titulo,
      descripcion,
      prioridad,
      latitud,
      longitud,
      visible_para_siguiente_turno
    }, {
      transaction: t
    });

    return historial;
  });
};

module.exports = createHistorialService;