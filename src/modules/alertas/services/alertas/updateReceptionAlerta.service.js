const db = require("../../../../database/models");

// Models
const {
  AlertaDestinatario
} = db;


const TRANSICIONES_PERMITIDAS = {
  RECIBIDA: [
    "PENDIENTE",
  ],
  LEIDA: [
    "PENDIENTE",
    "RECIBIDA",
  ],
};

const updateRecepcionAlertaService =
  async ({
    alerta_id,
    usuario_id,
    nuevo_estado,
  }) => {
    const transiciones =
      TRANSICIONES_PERMITIDAS[nuevo_estado];

    if (!transiciones) {
      throw new Error(
        "El estado solicitado no es válido"
      );
    }

    const recepcion =
      await AlertaDestinatario.findOne({
        where: {
          alerta_id,
          usuario_id,
        },
      });

    if (!recepcion) {
      throw new Error(
        "La alerta no existe o no fue enviada a este usuario"
      );
    }

    if (
      recepcion.estado === "ACEPTADA" ||
      recepcion.estado === "RECHAZADA" ||
      recepcion.estado === "ATENDIDA"
    ) {
      return recepcion;
    }

    if (
      !transiciones.includes(
        recepcion.estado
      )
    ) {
      return recepcion;
    }

    const cambios = {
      estado: nuevo_estado,
    };

    if (nuevo_estado === "RECIBIDA") {
      cambios.fecha_recibida =
        recepcion.fecha_recibida ||
        new Date();
    }

    if (nuevo_estado === "LEIDA") {
      cambios.fecha_recibida =
        recepcion.fecha_recibida ||
        new Date();

      cambios.fecha_leida =
        recepcion.fecha_leida ||
        new Date();
    }

    await recepcion.update(cambios);

    return recepcion;
  };

module.exports = updateRecepcionAlertaService;