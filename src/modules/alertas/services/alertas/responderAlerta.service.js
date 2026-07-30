const db = require("../../../../database/models");

// Validator
const {
  validarRespuestaAlerta,
} = require("../../validators/alertas/alerta.validator");

// Models
const { Alerta, AlertaDestinatario } = db;

const responderAlertaService = async ({
  alerta_id,
  usuario_id,
  body,
}) => {
  validarRespuestaAlerta(body);

  const {
    respuesta,
    observacion = null,
  } = body;

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
    });

  if (!recepcion) {
    throw new Error(
      "La alerta no existe o no fue enviada a este usuario"
    );
  }

  const alerta = recepcion.alerta;

  if (
    alerta.estado === "CANCELADA" ||
    alerta.estado === "ATENDIDA" ||
    alerta.estado === "EXPIRADA"
  ) {
    throw new Error(
      `No es posible responder una alerta en estado ${alerta.estado}`
    );
  }

  if (!alerta.requiere_confirmacion) {
    throw new Error(
      "Esta alerta no requiere confirmación"
    );
  }

  if (
    ["ACEPTADA", "RECHAZADA", "ATENDIDA"].includes(
      recepcion.estado
    )
  ) {
    throw new Error(
      "La alerta ya fue respondida"
    );
  }

  await recepcion.update({
    estado: respuesta,
    fecha_recibida:
      recepcion.fecha_recibida ||
      new Date(),
    fecha_leida:
      recepcion.fecha_leida ||
      new Date(),
    fecha_respuesta: new Date(),
    observacion:
      observacion?.trim() || null,
  });

  if (
    respuesta === "ACEPTADA" &&
    alerta.estado === "PENDIENTE"
  ) {
    await alerta.update({
      estado: "EN_ATENCION",
    });
  }

  return recepcion;
};

module.exports = responderAlertaService;