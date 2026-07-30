const { Op } = require("sequelize");
const db = require("../../../../database/models");

// Models
const {
  Alerta,
  AlertaDestinatario
} = db;


const marcarAlertaAtendidaService =
  async ({
    alerta_id,
    usuario_id,
    observacion = null,
  }) => {
    const transaction =
      await db.sequelize.transaction();

    try {
      const recepcion =
        await AlertaDestinatario.findOne({
          where: {
            alerta_id,
            usuario_id,
          },
          include: [
            {
              model: Alerta,
              as: "alerta",
            },
          ],
          transaction,
          lock: transaction.LOCK.UPDATE,
        });

      if (!recepcion) {
        throw new Error(
          "La alerta no existe o no fue enviada a este usuario"
        );
      }

      const alerta = recepcion.alerta;

      if (
        alerta.estado === "CANCELADA" ||
        alerta.estado === "EXPIRADA"
      ) {
        throw new Error(
          `No es posible atender una alerta en estado ${alerta.estado}`
        );
      }

      if (
        alerta.requiere_confirmacion &&
        recepcion.estado !== "ACEPTADA"
      ) {
        throw new Error(
          "Primero debe aceptar la alerta"
        );
      }

      if (recepcion.estado === "ATENDIDA") {
        await transaction.commit();
        return recepcion;
      }

      await recepcion.update(
        {
          estado: "ATENDIDA",
          fecha_recibida:
            recepcion.fecha_recibida ||
            new Date(),
          fecha_leida:
            recepcion.fecha_leida ||
            new Date(),
          fecha_respuesta:
            recepcion.fecha_respuesta ||
            new Date(),
          fecha_atendida: new Date(),
          observacion:
            observacion?.trim() ||
            recepcion.observacion,
        },
        {
          transaction,
        }
      );

      const pendientes =
        await AlertaDestinatario.count({
          where: {
            alerta_id,
            estado: {
              [Op.in]: [
                "PENDIENTE",
                "RECIBIDA",
                "LEIDA",
                "ACEPTADA",
              ],
            },
          },
          transaction,
        });

      if (pendientes === 0) {
        await alerta.update(
          {
            estado: "ATENDIDA",
          },
          {
            transaction,
          }
        );
      }

      await transaction.commit();

      return recepcion;
    } catch (error) {
      if (!transaction.finished) {
        await transaction.rollback();
      }

      throw error;
    }
  };

module.exports = marcarAlertaAtendidaService;