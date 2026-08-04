// ======================================================
// UTILIDADES
// ======================================================
const normalizarDestinatarios = (destinatarios) => {
  if (!Array.isArray(destinatarios)) {
    return [];
  }

  return [
    ...new Set(
      destinatarios
        .map((destinatario) => {
          // Permite recibir directamente:
          // [6, 8, "10"]
          if (
            typeof destinatario === "number" ||
            typeof destinatario === "string"
          ) {
            return Number(destinatario);
          }

          // También permite recibir:
          // [{ id: 6 }, { usuario_id: 8 }]
          if (
            destinatario &&
            typeof destinatario === "object"
          ) {
            return Number(
              destinatario.usuario_id ??
              destinatario.id
            );
          }

          return NaN;
        })
        .filter(
          (usuarioId) =>
            Number.isInteger(usuarioId) &&
            usuarioId > 0
        )
    ),
  ];
};

const normalizarUsuariosIds = (
  usuariosIds = []
) => {
  if (!Array.isArray(usuariosIds)) {
    return [];
  }

  return [
    ...new Set(
      usuariosIds
        .map(Number)
        .filter(
          (id) =>
            Number.isInteger(id) &&
            id > 0
        )
    ),
  ];
};

const normalizarUsuarioId = (
  usuarioId
) => {
  const id = Number(usuarioId);

  if (
    !Number.isInteger(id) ||
    id <= 0
  ) {
    return null;
  }

  return id;
};

const convertirAJson = (data) => {
  if (
    data &&
    typeof data.toJSON === "function"
  ) {
    return data.toJSON();
  }

  return data;
};

// ======================================================
// EMISORES GENÉRICOS
// ======================================================

const emitirARoom = ({
  io,
  room,
  evento,
  payload,
}) => {
  if (!io) {
    throw new Error(
      "La instancia de Socket.IO es obligatoria"
    );
  }

  if (
    typeof room !== "string" ||
    !room.trim()
  ) {
    return false;
  }

  if (
    typeof evento !== "string" ||
    !evento.trim()
  ) {
    return false;
  }

  io.to(room.trim()).emit(
    evento.trim(),
    payload
  );

  return true;
};

const emitirAUsuario = ({
  io,
  usuarioId,
  evento,
  payload,
}) => {
  const id =
    normalizarUsuarioId(usuarioId);

  if (id === null) {
    return false;
  }

  return emitirARoom({
    io,
    room: `usuario:${id}`,
    evento,
    payload,
  });
};

const emitirAUsuarios = ({
  io,
  usuariosIds = [],
  evento,
  payload,
}) => {
  const idsUnicos =
    normalizarUsuariosIds(
      usuariosIds
    );

  for (const usuarioId of idsUnicos) {
    emitirAUsuario({
      io,
      usuarioId,
      evento,
      payload,
    });
  }

  return idsUnicos.length;
};

// ======================================================
// 1. ENVIAR NUEVA ALERTA A UN USUARIO
// ======================================================
const emitirAlertaAUsuario = (
  io,
  usuarioId,
  payload
) => {
  return emitirAUsuario({
    io,
    usuarioId,
    evento: "alerta:nueva",
    payload,
  });
};

// ======================================================
// 2. ENVIAR NUEVA ALERTA A VARIOS USUARIOS
// ======================================================
const emitirAlertaAUsuarios = (
  io,
  usuariosIds = [],
  payload
) => {
  return emitirAUsuarios({
    io,
    usuariosIds,
    evento: "alerta:nueva",
    payload,
  });
};

// ======================================================
// 3. ENVIAR NUEVA ALERTA A UN ROL
// ======================================================
const emitirAlertaARol = (
  io,
  rol,
  payload
) => {
  if (
    typeof rol !== "string" ||
    !rol.trim()
  ) {
    return false;
  }

  return emitirARoom({
    io,
    room: `rol:${rol.trim()}`,
    evento: "alerta:nueva",
    payload,
  });
};

// ======================================================
// 4. ENVIAR NUEVA ALERTA A OPERADORES
// ======================================================
const emitirAlertaAOperadores = (
  io,
  payload
) => {
  return emitirARoom({
    io,
    room: "operadores",
    evento: "alerta:nueva",
    payload,
  });
};

// ======================================================
// 5. INFORMAR A OPERADORES QUE SE CREÓ UNA ALERTA
// ======================================================
const emitirAlertaCreadaAOperadores = (
  io,
  payload
) => {
  return emitirARoom({
    io,
    room: "operadores",
    evento: "alerta:creada",
    payload,
  });
};

// ======================================================
// 6. ENVIAR ALERTA ACTUALIZADA A UN USUARIO
// ======================================================
const emitirAlertaActualizada = (
  io,
  usuarioId,
  payload
) => {
  return emitirAUsuario({
    io,
    usuarioId,
    evento: "alerta:actualizada",
    payload,
  });
};

// ======================================================
// 7. ENVIAR ACTUALIZACIÓN A OPERADORES
// ======================================================
const emitirActualizacionAOperadores = (
  io,
  payload
) => {
  return emitirARoom({
    io,
    room: "operadores",
    evento: "alerta:actualizada",
    payload,
  });
};

// ======================================================
// 8. ENVIAR CANCELACIÓN A VARIOS USUARIOS
// ======================================================
const emitirAlertaCancelada = (
  io,
  usuariosIds = [],
  payload
) => {
  return emitirAUsuarios({
    io,
    usuariosIds,
    evento: "alerta:cancelada",
    payload,
  });
};

// ======================================================
// 9. EMITIR ALERTA CREADA DESDE SERVICE REST
// ======================================================
const emitirAlertaPorSocket = ({
  alerta,
  destinatariosIds = [],
}) => {
  try {
    /*
     * Importación interna para evitar problemas
     * durante la inicialización de Socket.IO.
     */
    const {
      getIO,
    } = require("../index");

    const io = getIO();

    if (!alerta) {
      throw new Error(
        "La alerta es obligatoria para emitirla por Socket.IO"
      );
    }

    const idsUnicos =
      normalizarUsuariosIds(
        destinatariosIds
      );

    const alertaJson =
      convertirAJson(alerta);

    const payload = {
      success: true,
      message:
        "Nueva alerta recibida",
      data: alertaJson,
      timestamp:
        new Date().toISOString(),
    };

    const totalEmitidos =
      emitirAlertaAUsuarios(
        io,
        idsUnicos,
        payload
      );

    emitirAlertaCreadaAOperadores(
      io,
      payload
    );

    console.log(
      `🔔 Alerta ${alertaJson.id} emitida a usuarios: ${idsUnicos.length > 0
        ? idsUnicos.join(", ")
        : "sin destinatarios"
      }`
    );

    return {
      success: true,
      destinatarios_emitidos:
        totalEmitidos,
    };
  } catch (error) {
    console.error(
      "⚠️ La alerta fue creada, pero no pudo emitirse por Socket.IO:",
      error.message
    );

    return {
      success: false,
      destinatarios_emitidos: 0,
      error: error.message,
    };
  }
};

module.exports = {
  emitirAlertaAUsuario,
  emitirAlertaAUsuarios,
  emitirAlertaARol,
  emitirAlertaAOperadores,
  emitirAlertaCreadaAOperadores,
  emitirAlertaActualizada,
  emitirActualizacionAOperadores,
  emitirAlertaCancelada,
  emitirAlertaPorSocket,
  normalizarDestinatarios
};