const db = require("../../database/models");

const {
  emitirAlertaAOperadores,
  emitirAlertaAUsuarios,
  emitirActualizacionAOperadores,
} = require("../services/alerta_socket.service");

const {
  Alerta,
  AlertaDestinatario,
  sequelize,
} = db;

const TIPOS_ALERTA_SERENO = [
  "PANICO",
  "INCIDENCIA",
  "EMERGENCIA",
  "SOS",
];

const PRIORIDADES_VALIDAS = [
  "BAJA",
  "MEDIA",
  "ALTA",
  "CRITICA",
];

const responderCallback = (
  callback,
  respuesta
) => {
  if (typeof callback === "function") {
    callback(respuesta);
  }
};

const normalizarIds = (ids = []) => {
  if (!Array.isArray(ids)) {
    return [];
  }

  return [
    ...new Set(
      ids
        .map(Number)
        .filter(
          (id) =>
            Number.isInteger(id) &&
            id > 0
        )
    ),
  ];
};

const validarAlertaSereno = (data) => {
  if (!data || typeof data !== "object") {
    throw new Error(
      "Los datos de la alerta son obligatorios"
    );
  }

  if (!data.tipo) {
    throw new Error(
      "El tipo de alerta es obligatorio"
    );
  }

  if (
    !TIPOS_ALERTA_SERENO.includes(
      data.tipo
    )
  ) {
    throw new Error(
      `El tipo de alerta ${data.tipo} no está permitido para el sereno`
    );
  }

  if (!data.titulo?.trim()) {
    throw new Error(
      "El título de la alerta es obligatorio"
    );
  }

  if (!data.descripcion?.trim()) {
    throw new Error(
      "La descripción de la alerta es obligatoria"
    );
  }

  if (
    data.prioridad &&
    !PRIORIDADES_VALIDAS.includes(
      data.prioridad
    )
  ) {
    throw new Error(
      "La prioridad enviada no es válida"
    );
  }

  const requiereUbicacion = [
    "PANICO",
    "EMERGENCIA",
    "SOS",
  ].includes(data.tipo);

  if (
    requiereUbicacion &&
    (
      data.latitud == null ||
      data.longitud == null
    )
  ) {
    throw new Error(
      "La ubicación es obligatoria para este tipo de alerta"
    );
  }
};

module.exports = (io, socket) => {
  // ======================================================
  // CREAR ALERTA DESDE EL SERENO
  // ======================================================

  // socket.off("alerta:crear-sereno");

  socket.on(
    "alerta:crear-sereno",
    async (data, callback) => {
      const transaction =
        await sequelize.transaction();

      try {
        validarAlertaSereno(data);

        const emisorId = Number(
          socket.usuario.id
        );

        const destinatariosIds =
          normalizarIds(
            data.destinatarios_ids
          );

        const alerta = await Alerta.create(
          {
            emisor_id: emisorId,

            patrullaje_id:
              data.patrullaje_id ?? null,

            zona_id:
              data.zona_id ?? null,

            incidencia_id:
              data.incidencia_id ?? null,

            titulo:
              data.titulo.trim(),

            tipo:
              data.tipo,

            prioridad:
              data.prioridad ?? "ALTA",

            descripcion:
              data.descripcion.trim(),

            latitud:
              data.latitud ?? null,

            longitud:
              data.longitud ?? null,

            requiere_confirmacion:
              data.requiere_confirmacion ??
              false,

            fecha_expiracion:
              data.fecha_expiracion ?? null,

            estado:
              "PENDIENTE",
          },
          {
            transaction,
          }
        );

        // Si se enviaron destinatarios concretos,
        // se registran en alerta_destinatarios.
        if (destinatariosIds.length > 0) {
          const destinatarios =
            destinatariosIds.map(
              (usuarioId) => ({
                alerta_id: alerta.id,
                usuario_id: usuarioId,
                estado: "PENDIENTE",
              })
            );

          await AlertaDestinatario.bulkCreate(
            destinatarios,
            {
              transaction,
              ignoreDuplicates: true,
            }
          );
        }

        await transaction.commit();

        const alertaCreada =
          await Alerta.findByPk(
            alerta.id,
            {
              include: [
                {
                  model: db.Usuario,
                  as: "emisor",
                  attributes: [
                    "id",
                    "username",
                    "correo",
                  ],
                  required: false,
                },
                {
                  model: db.Zonas,
                  as: "zona",
                  required: false,
                },
                {
                  model: db.PatrullajeProgramado,
                  as: "patrullaje",
                  required: false,
                },
                {
                  model:
                    db.Incidencia,
                  as: "incidencia",
                  required: false,
                },
                {
                  model:
                    db.AlertaDestinatario,
                  as: "destinatarios",
                  required: false,
                },
              ],
            }
          );

        const payload = {
          success: true,
          message:
            "Nueva alerta registrada",
          data: alertaCreada,
          timestamp:
            new Date().toISOString(),
        };

        // Alertas del sereno hacia central
        emitirAlertaAOperadores(
          io,
          payload
        );

        // En caso de que también existan
        // destinatarios específicos
        if (destinatariosIds.length > 0) {
          emitirAlertaAUsuarios(
            io,
            destinatariosIds,
            payload
          );
        }

        console.log(
          `🚨 Alerta ${alerta.id} registrada por usuario ${emisorId}`
        );

        responderCallback(callback, {
          ok: true,
          message:
            "Alerta enviada correctamente",
          data: alertaCreada,
        });
      } catch (error) {
        if (
          transaction &&
          !transaction.finished
        ) {
          await transaction.rollback();
        }

        console.error(
          "❌ Error registrando alerta:",
          error
        );

        responderCallback(callback, {
          ok: false,
          message:
            "No se pudo registrar la alerta",
          error: error.message,
        });
      }
    }
  );

  // ======================================================
  // CONFIRMAR RECEPCIÓN
  // ======================================================

  // socket.off("alerta:recibida");

  socket.on(
    "alerta:recibida",
    async (data, callback) => {
      try {
        const usuarioId = Number(
          socket.usuario.id
        );

        const alertaId = Number(
          data?.alerta_id
        );

        if (
          !Number.isInteger(alertaId) ||
          alertaId <= 0
        ) {
          throw new Error(
            "El ID de la alerta no es válido"
          );
        }

        const destinatario =
          await AlertaDestinatario.findOne({
            where: {
              alerta_id: alertaId,
              usuario_id: usuarioId,
            },
          });

        if (!destinatario) {
          throw new Error(
            "El usuario no es destinatario de esta alerta"
          );
        }

        if (
          destinatario.estado ===
          "PENDIENTE"
        ) {
          await destinatario.update({
            estado: "RECIBIDA",
            fecha_recibida:
              destinatario.fecha_recibida ??
              new Date(),
          });
        }

        const payload = {
          alerta_id: alertaId,
          usuario_id: usuarioId,
          estado:
            destinatario.estado,
          fecha_recibida:
            destinatario.fecha_recibida,
        };

        emitirActualizacionAOperadores(
          io,
          payload
        );

        responderCallback(callback, {
          ok: true,
          message:
            "Recepción confirmada",
          data: payload,
        });
      } catch (error) {
        console.error(
          "❌ Error confirmando recepción:",
          error
        );

        responderCallback(callback, {
          ok: false,
          message:
            "No se pudo confirmar la recepción",
          error: error.message,
        });
      }
    }
  );

  // ======================================================
  // MARCAR COMO LEÍDA
  // ======================================================
  // socket.off("alerta:leida");

  socket.on(
    "alerta:leida",
    async (data, callback) => {
      try {
        const usuarioId = Number(
          socket.usuario.id
        );

        const alertaId = Number(
          data?.alerta_id
        );

        if (
          !Number.isInteger(alertaId) ||
          alertaId <= 0
        ) {
          throw new Error(
            "El ID de la alerta no es válido"
          );
        }

        const destinatario =
          await AlertaDestinatario.findOne({
            where: {
              alerta_id: alertaId,
              usuario_id: usuarioId,
            },
          });

        if (!destinatario) {
          throw new Error(
            "El usuario no es destinatario de esta alerta"
          );
        }

        if (
          ![
            "ACEPTADA",
            "RECHAZADA",
            "ATENDIDA",
          ].includes(destinatario.estado)
        ) {
          await destinatario.update({
            estado: "LEIDA",

            fecha_recibida:
              destinatario.fecha_recibida ??
              new Date(),

            fecha_leida:
              destinatario.fecha_leida ??
              new Date(),
          });
        }

        const payload = {
          alerta_id: alertaId,
          usuario_id: usuarioId,
          estado:
            destinatario.estado,
          fecha_leida:
            destinatario.fecha_leida,
        };

        emitirActualizacionAOperadores(
          io,
          payload
        );

        responderCallback(callback, {
          ok: true,
          message:
            "Alerta marcada como leída",
          data: payload,
        });
      } catch (error) {
        console.error(
          "❌ Error marcando alerta como leída:",
          error
        );

        responderCallback(callback, {
          ok: false,
          message:
            "No se pudo marcar la alerta como leída",
          error: error.message,
        });
      }
    }
  );

  // ======================================================
  // RESPONDER ALERTA
  // ======================================================

  // socket.off("alerta:responder");

  socket.on(
    "alerta:responder",
    async (data, callback) => {
      try {
        const usuarioId = Number(
          socket.usuario.id
        );

        const alertaId = Number(
          data?.alerta_id
        );

        const respuesta =
          data?.respuesta;

        if (
          !Number.isInteger(alertaId) ||
          alertaId <= 0
        ) {
          throw new Error(
            "El ID de la alerta no es válido"
          );
        }

        if (
          ![
            "ACEPTADA",
            "RECHAZADA",
          ].includes(respuesta)
        ) {
          throw new Error(
            "La respuesta debe ser ACEPTADA o RECHAZADA"
          );
        }

        const destinatario =
          await AlertaDestinatario.findOne({
            where: {
              alerta_id: alertaId,
              usuario_id: usuarioId,
            },
          });

        if (!destinatario) {
          throw new Error(
            "El usuario no es destinatario de esta alerta"
          );
        }

        if (
          destinatario.estado ===
          "ATENDIDA"
        ) {
          throw new Error(
            "La alerta ya fue atendida"
          );
        }

        await destinatario.update({
          estado: respuesta,

          fecha_recibida:
            destinatario.fecha_recibida ??
            new Date(),

          fecha_leida:
            destinatario.fecha_leida ??
            new Date(),

          fecha_respuesta: new Date(),

          observacion:
            data.observacion?.trim() ||
            null,
        });

        if (respuesta === "ACEPTADA") {
          await Alerta.update(
            {
              estado: "EN_ATENCION",
            },
            {
              where: {
                id: alertaId,
                estado: "PENDIENTE",
              },
            }
          );
        }

        const payload = {
          alerta_id: alertaId,
          usuario_id: usuarioId,
          respuesta,
          observacion:
            destinatario.observacion,
          fecha_respuesta:
            destinatario.fecha_respuesta,
        };

        emitirActualizacionAOperadores(
          io,
          payload
        );

        responderCallback(callback, {
          ok: true,
          message:
            respuesta === "ACEPTADA"
              ? "Alerta aceptada correctamente"
              : "Alerta rechazada correctamente",
          data: payload,
        });
      } catch (error) {
        console.error(
          "❌ Error respondiendo alerta:",
          error
        );

        responderCallback(callback, {
          ok: false,
          message:
            "No se pudo responder la alerta",
          error: error.message,
        });
      }
    }
  );

  // ======================================================
  // MARCAR ALERTA COMO ATENDIDA
  // ======================================================

  // socket.off("alerta:atendida");

  socket.on(
    "alerta:atendida",
    async (data, callback) => {
      const transaction =
        await sequelize.transaction();

      try {
        const usuarioId = Number(
          socket.usuario.id
        );

        const alertaId = Number(
          data?.alerta_id
        );

        if (
          !Number.isInteger(alertaId) ||
          alertaId <= 0
        ) {
          throw new Error(
            "El ID de la alerta no es válido"
          );
        }

        const destinatario =
          await AlertaDestinatario.findOne({
            where: {
              alerta_id: alertaId,
              usuario_id: usuarioId,
            },
            transaction,
            lock:
              transaction.LOCK.UPDATE,
          });

        if (!destinatario) {
          throw new Error(
            "El usuario no es destinatario de esta alerta"
          );
        }

        await destinatario.update(
          {
            estado: "ATENDIDA",

            fecha_recibida:
              destinatario.fecha_recibida ??
              new Date(),

            fecha_leida:
              destinatario.fecha_leida ??
              new Date(),

            fecha_respuesta:
              destinatario.fecha_respuesta ??
              new Date(),

            fecha_atendida:
              new Date(),

            observacion:
              data.observacion?.trim() ||
              destinatario.observacion,
          },
          {
            transaction,
          }
        );

        await Alerta.update(
          {
            estado: "ATENDIDA",
          },
          {
            where: {
              id: alertaId,
            },
            transaction,
          }
        );

        await transaction.commit();

        const payload = {
          alerta_id: alertaId,
          usuario_id: usuarioId,
          estado: "ATENDIDA",
          fecha_atendida:
            destinatario.fecha_atendida,
          observacion:
            destinatario.observacion,
        };

        emitirActualizacionAOperadores(
          io,
          payload
        );

        responderCallback(callback, {
          ok: true,
          message:
            "Alerta marcada como atendida",
          data: payload,
        });
      } catch (error) {
        if (
          transaction &&
          !transaction.finished
        ) {
          await transaction.rollback();
        }

        console.error(
          "❌ Error atendiendo alerta:",
          error
        );

        responderCallback(callback, {
          ok: false,
          message:
            "No se pudo marcar la alerta como atendida",
          error: error.message,
        });
      }
    }
  );
};