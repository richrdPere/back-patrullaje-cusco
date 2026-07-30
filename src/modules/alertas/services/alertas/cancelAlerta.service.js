const db = require("../../../../database/models");

// Models
const {
  Alerta,
  Usuario,
  AlertaDestinatario,
} = db;

// Services
const cancelarAlertaService = async ({
  alerta_id,
  usuario_id,
  rol,
  body = {},
}) => {
  const alertaId = Number(alerta_id);
  const usuarioId = Number(usuario_id);

  if (!Number.isInteger(alertaId) || alertaId <= 0) {
    throw new Error(
      "El identificador de la alerta no es válido"
    );
  }

  if (!Number.isInteger(usuarioId) || usuarioId <= 0) {
    throw new Error(
      "El identificador del usuario no es válido"
    );
  }

  const motivo =
    typeof body.motivo === "string"
      ? body.motivo.trim()
      : "";

  if (!motivo) {
    throw new Error(
      "El motivo de cancelación es obligatorio"
    );
  }

  if (motivo.length > 1000) {
    throw new Error(
      "El motivo de cancelación no puede superar los 1000 caracteres"
    );
  }

  const transaction =
    await db.sequelize.transaction();

  try {
    const alerta = await Alerta.findByPk(
      alertaId,
      {
        transaction,
        lock: transaction.LOCK.UPDATE,
      }
    );

    if (!alerta) {
      throw new Error(
        "La alerta solicitada no existe"
      );
    }

    const rolesConAccesoGlobal = [
      "ADMIN",
      "GERENTE_SERENAZGO",
      "SUPERVISOR_SERENAZGO",
    ];

    const tieneAccesoGlobal =
      rolesConAccesoGlobal.includes(rol);

    if (
      !tieneAccesoGlobal &&
      Number(alerta.emisor_id) !== usuarioId
    ) {
      throw new Error(
        "No tiene permisos para cancelar esta alerta"
      );
    }

    if (alerta.estado === "CANCELADA") {
      await transaction.commit();

      const alertaCancelada =
        await Alerta.findByPk(alertaId, {
          include: [
            {
              model: Usuario,
              as: "emisor",
              attributes: [
                "id",
                "username",
                "correo",
              ],
            },
            {
              model: Usuario,
              as: "usuarioCancelacion",
              attributes: [
                "id",
                "username",
                "correo",
              ],
              required: false,
            },
          ],
        });

      return {
        alerta: alertaCancelada,
        ya_cancelada: true,
      };
    }

    if (alerta.estado === "ATENDIDA") {
      throw new Error(
        "No es posible cancelar una alerta que ya fue atendida"
      );
    }

    if (alerta.estado === "EXPIRADA") {
      throw new Error(
        "No es posible cancelar una alerta expirada"
      );
    }

    await alerta.update(
      {
        estado: "CANCELADA",
        motivo_cancelacion: motivo,
        cancelada_por: usuarioId,
        fecha_cancelacion: new Date(),
      },
      {
        transaction,
      }
    );

    /*
     * No se modifica el estado de AlertaDestinatario.
     *
     * Esto permite conservar el historial individual:
     * - quién la recibió
     * - quién la leyó
     * - quién la aceptó
     * - quién la atendió antes de ser cancelada
     *
     * El estado general CANCELADA indica que la alerta
     * ya no requiere atención.
     */

    const totalDestinatarios =
      await AlertaDestinatario.count({
        where: {
          alerta_id: alertaId,
        },
        transaction,
      });

    await transaction.commit();

    const alertaCancelada =
      await Alerta.findByPk(alertaId, {
        attributes: [
          "id",
          "emisor_id",
          "patrullaje_id",
          "zona_id",
          "incidencia_id",
          "titulo",
          "tipo",
          "prioridad",
          "descripcion",
          "latitud",
          "longitud",
          "requiere_confirmacion",
          "fecha_expiracion",
          "estado",
          "motivo_cancelacion",
          "cancelada_por",
          "fecha_cancelacion",
          "createdAt",
          "updatedAt",
        ],
        include: [
          {
            model: Usuario,
            as: "emisor",
            attributes: [
              "id",
              "username",
              "correo",
            ],
          },
          {
            model: Usuario,
            as: "usuarioCancelacion",
            attributes: [
              "id",
              "username",
              "correo",
            ],
            required: false,
          },
        ],
      });

    return {
      alerta: alertaCancelada,
      total_destinatarios:
        totalDestinatarios,
      ya_cancelada: false,
    };
  } catch (error) {
    if (!transaction.finished) {
      await transaction.rollback();
    }

    throw error;
  }
};

module.exports = cancelarAlertaService;