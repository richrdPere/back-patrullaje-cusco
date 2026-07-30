// ======================================================
// UTILIDADES
// ======================================================
const normalizarUsuariosIds = (usuariosIds = []) => {
  if (!Array.isArray(usuariosIds)) {
    return [];
  }

  return [
    ...new Set(
      usuariosIds
        .map((id) => Number(id))
        .filter(
          (id) =>
            Number.isInteger(id) &&
            id > 0
        )
    ),
  ];
};

// ======================================================
// 1. ENVIAR ALERTA A UN USUARIO
// ======================================================
const emitirAlertaAUsuario = (
  io,
  usuarioId,
  alerta
) => {
  const id = Number(usuarioId);

  if (
    !Number.isInteger(id) ||
    id <= 0
  ) {
    return;
  }

  io.to(`usuario:${id}`).emit(
    "alerta:nueva",
    alerta
  );
};

// ======================================================
// 2. ENVIAR ALERTA A VARIOS USUARIOS
// ======================================================
const emitirAlertaAUsuarios = (
  io,
  usuariosIds = [],
  alerta
) => {
  const idsUnicos =
    normalizarUsuariosIds(usuariosIds);

  for (const usuarioId of idsUnicos) {
    emitirAlertaAUsuario(
      io,
      usuarioId,
      alerta
    );
  }
};

// ======================================================
// 3. ENVIAR ALERTA A UN ROL
// ======================================================
const emitirAlertaARol = (
  io,
  rol,
  alerta
) => {
  if (
    typeof rol !== "string" ||
    !rol.trim()
  ) {
    return;
  }

  io.to(`rol:${rol.trim()}`).emit(
    "alerta:nueva",
    alerta
  );
};

// ======================================================
// 4. ENVIAR NUEVA ALERTA A OPERADORES
// ======================================================
const emitirAlertaAOperadores = (
  io,
  alerta
) => {
  io.to("operadores").emit(
    "alerta:nueva",
    alerta
  );
};

// ======================================================
// 5. INFORMAR A LA CENTRAL QUE SE CREÓ UNA ALERTA
// ======================================================
const emitirAlertaCreadaAOperadores = (
  io,
  alerta
) => {
  io.to("operadores").emit(
    "alerta:creada",
    alerta
  );
};

// ======================================================
// 6. ENVIAR ACTUALIZACIÓN A UN USUARIO
// ======================================================
const emitirAlertaActualizada = (
  io,
  usuarioId,
  payload
) => {
  const id = Number(usuarioId);

  if (
    !Number.isInteger(id) ||
    id <= 0
  ) {
    return;
  }

  io.to(`usuario:${id}`).emit(
    "alerta:actualizada",
    payload
  );
};

// ======================================================
// 7. ENVIAR ACTUALIZACIÓN A OPERADORES
// ======================================================
const emitirActualizacionAOperadores = (
  io,
  payload
) => {
  io.to("operadores").emit(
    "alerta:actualizada",
    payload
  );
};

// ======================================================
// 8. ENVIAR CANCELACIÓN A VARIOS USUARIOS
// ======================================================
const emitirAlertaCancelada = (
  io,
  usuariosIds = [],
  payload
) => {
  const idsUnicos =
    normalizarUsuariosIds(usuariosIds);

  for (const usuarioId of idsUnicos) {
    io.to(`usuario:${usuarioId}`).emit(
      "alerta:cancelada",
      payload
    );
  }
};

// ======================================================
// 9. EMITIR ALERTA CREADA DESDE UN SERVICE REST
// ======================================================
const emitirAlertaPorSocket = ({
  alerta,
  destinatariosIds = [],
}) => {
  try {
    /*
     * Se importa aquí para disminuir el riesgo de dependencia
     * circular durante la inicialización de Socket.IO.
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
      typeof alerta.toJSON === "function"
        ? alerta.toJSON()
        : alerta;

    const payload = {
      success: true,
      message:
        "Nueva alerta recibida",
      data: alertaJson,
      timestamp:
        new Date().toISOString(),
    };

    // Enviar a los usuarios destinatarios
    emitirAlertaAUsuarios(
      io,
      idsUnicos,
      payload
    );

    // Informar al panel web de la central
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
        idsUnicos.length,
    };
  } catch (error) {
    /*
     * La alerta ya fue confirmada en la base de datos.
     * Un error de Socket.IO no debe revertir la operación.
     */
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
};