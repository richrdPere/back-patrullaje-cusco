
const db = require("../../../database/models");

const {
  sequelize,
  HistorialPatrullaje,
  PatrullajeProgramado
} = db;

const updateHistorialService = async (historialId, usuarioId, data) => {

  const {
    titulo,
    descripcion,
    prioridad,
    visible_para_siguiente_turno
  } = data;

  return await sequelize.transaction(async (t) => {

    // ==========================
    // BUSCAR HISTORIAL
    // ==========================
    const historial = await HistorialPatrullaje.findByPk(
      historialId,
      {
        include: [
          {
            model: PatrullajeProgramado,
            as: "patrullaje"
          }
        ],
        transaction: t
      }
    );

    if (!historial) {
      const error = new Error("El historial no existe.");
      error.statusCode = 404;
      throw error;
    }

    // ==========================
    // VALIDAR PROPIETARIO
    // ==========================
    if (historial.sereno_id !== usuarioId) {
      const error = new Error(
        "No tienes permiso para modificar este historial."
      );
      error.statusCode = 403;
      throw error;
    }

    // ==========================
    // VALIDAR ESTADO DEL HISTORIAL
    // ==========================
    if (historial.estado !== "ACTIVO") {
      const error = new Error(
        "El historial ya no puede modificarse."
      );
      error.statusCode = 400;
      throw error;
    }

    // ==========================
    // VALIDAR ESTADO DEL PATRULLAJE
    // ==========================
    if (historial.patrullaje.estado !== "EN_CURSO") {
      const error = new Error(
        "Solo se puede editar historial de patrullajes en curso."
      );
      error.statusCode = 400;
      throw error;
    }

    // ==========================
    // ACTUALIZAR
    // ==========================
    historial.titulo = titulo;
    historial.descripcion = descripcion;
    historial.prioridad = prioridad;
    historial.visible_para_siguiente_turno =
      visible_para_siguiente_turno;

    await historial.save({
      transaction: t
    });

    return historial;

  });

};

module.exports = updateHistorialService;