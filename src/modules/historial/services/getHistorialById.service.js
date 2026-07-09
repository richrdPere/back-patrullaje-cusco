const db = require("../../../database/models");

const {
  HistorialPatrullaje,
  Usuario,
  Persona,
  Zonas
} = db;

const getHistorialByIdService = async (historialId) => {

  const historial = await HistorialPatrullaje.findByPk(historialId, {

    include: [

      {
        model: Usuario,
        as: "usuario",

        attributes: ["id"],

        include: [
          {
            model: Persona,
            as: "persona",

            attributes: [
              "nombres",
              "apellidos",
            ]
          }
        ]
      },

      {
        model: Zonas,
        as: "zona",

        attributes: [
          "id",
          "nombre",
          "riesgo"
        ]
      }

    ]

  });

  if (!historial) {
    const error = new Error("El historial no existe.");
    error.statusCode = 404;
    throw error;
  }

  return {
    id: historial.id,
    patrullaje_id: historial.patrullaje_id,
    tipo: historial.tipo,
    titulo: historial.titulo,
    descripcion: historial.descripcion,
    prioridad: historial.prioridad,
    latitud: historial.latitud,
    longitud: historial.longitud,
    visible_para_siguiente_turno: historial.visible_para_siguiente_turno,
    fecha_hora: historial.fecha_hora,
    estado: historial.estado,
    sereno: {
      id: historial.sereno?.id,
      nombres: historial.sereno?.persona?.nombres,
      apellidos: historial.sereno?.persona?.apellidos,
    },
    zona: {
      id: historial.zona?.id,
      nombre: historial.zona?.nombre,
      riesgo: historial.zona?.riesgo
    }
  };
};

module.exports = getHistorialByIdService;