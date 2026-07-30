const db = require("../../../database/models");

const {
  HistorialPatrullaje,
  PatrullajeProgramado,
  Usuario,
  Persona,
  Zonas
} = db;

const getHistorialByPatrullajeService = async (patrullajeId) => {

  // ==========================
  // VALIDAR PATRULLAJE
  // ==========================
  const patrullaje = await PatrullajeProgramado.findByPk(
    patrullajeId
  );

  if (!patrullaje) {
    const error = new Error("El patrullaje no existe.");
    error.statusCode = 404;
    throw error;
  }

  // ==========================
  // CONSULTAR HISTORIAL
  // ==========================
  const historial = await HistorialPatrullaje.findAll({

    where: {
      patrullaje_id: patrullajeId,
      estado: "ACTIVO"
    },
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
          "nombre"
        ]
      }
    ],
    order: [
      ["fecha_hora", "DESC"]
    ]

  });

  return historial.map(item => ({
    id: item.id,
    tipo: item.tipo,
    titulo: item.titulo,
    descripcion: item.descripcion,
    prioridad: item.prioridad,
    latitud: item.latitud,
    longitud: item.longitud,
    visible_para_siguiente_turno: item.visible_para_siguiente_turno,
    fecha_hora: item.fecha_hora,
    sereno: item.usuario
      ? {
        id: item.usuario.id,
        nombres: item.usuario.persona?.nombres ?? null,
        apellidos: item.usuario.persona?.apellidos ?? null,
      }
      : null,
    zona: item.zona
      ? {
        id: item.zona.id,
        nombre: item.zona.nombre,
      }
      : null
  }));
};

module.exports = getHistorialByPatrullajeService;