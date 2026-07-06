const { Op } = require("sequelize");
const db = require("../../../../database/models");

const {
  PatrullajeProgramado,
  PatrullajePersonal,
  UnidadPatrullaje,
  Zonas,
} = db;

const getPatrullajeActivoService = async (usuarioId) => {

  const relacion = await PatrullajePersonal.findOne({
    where: {
      usuario_id: usuarioId,
      tipo_personal: "SERENO",
    },
    include: [
      {
        model: PatrullajeProgramado,
        as: "patrullaje",
        where: {
          estado: {
            [Op.in]: ["ASIGNADO", "EN_CURSO"],
          },
        },
        include: [
          {
            model: Zonas,
            as: "zona",
            attributes: [
              "id",
              "nombre",
              "riesgo",
              "coordenadas",
              "descripcion",
            ],
          },
          {
            model: UnidadPatrullaje,
            as: "unidad",
            attributes: [
              "codigo",
              "tipo",
              "placa",
            ],
          },
        ],
      },
    ],
  });

  if (!relacion || !relacion.patrullaje) {
    return null;
  }

  const patrullaje = relacion.patrullaje;

  return {
    id: patrullaje.id,
    fecha: patrullaje.fecha,
    hora_inicio: patrullaje.hora_inicio,
    hora_fin: patrullaje.hora_fin,
    estado: patrullaje.estado,
    descripcion: patrullaje.descripcion,

    zona: {
      id: patrullaje.zona?.id,
      nombre: patrullaje.zona?.nombre,
      descripcion: patrullaje.zona?.descripcion,
      riesgo: patrullaje.zona?.riesgo,
      coordenadas: patrullaje.zona?.coordenadas,
    },

    unidad: {
      codigo: patrullaje.unidad?.codigo,
      tipo: patrullaje.unidad?.tipo,
      placa: patrullaje.unidad?.placa,
    },
  };
};

module.exports = getPatrullajeActivoService;