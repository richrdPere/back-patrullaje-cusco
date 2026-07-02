const { Op } = require("sequelize");

const db = require("../../../../database/models");

// Modelos
const {
  PatrullajeProgramado,
  PatrullajePersonal,
  UnidadPatrullaje,
  Usuario,
  Persona,
  Roles,
  Policia,
  Zonas
} = db;

// Listar Patrullajes Programados
const listarPatrullajesProgramadosService = async (query) => {

  let {
    page = 1,
    limit = 5,
    fecha,
    descripcion
  } = query;

  page = Number(page);
  limit = Number(limit);

  const offset = (page - 1) * limit;

  const where = {};

  if (fecha) {
    where.fecha = fecha;
  }

  if (descripcion) {
    where.descripcion = {
      [Op.like]: `%${descripcion}%`
    };
  }

  const { count, rows } =
    await PatrullajeProgramado.findAndCountAll({
      where,
      limit,
      offset,
      distinct: true,
      order: [

        ["fecha", "DESC"],

        ["hora_inicio", "ASC"]

      ],

      include: [

        {
          model: UnidadPatrullaje,
          as: "unidad",

          attributes: [
            "id",
            "codigo",
            "tipo",
            "placa",
            "estado"
          ]
        },

        {
          model: Zonas,
          as: "zona",

          attributes: [
            "id",
            "nombre",
            "descripcion",
            "riesgo"
          ]
        },

        {
          model: PatrullajePersonal,
          as: "personal",

          include: [

            {

              model: Usuario,
              as: "usuario",

              required: false,

              attributes: [
                "id"
              ],
              include: [
                {
                  model: Persona,
                  as: "persona",
                  attributes: [
                    "nombres",
                    "apellidos"
                  ]
                },
                {
                  model: Roles,
                  as: "roles",
                  attributes: [
                    "nombre"
                  ],
                  through: {
                    attributes: []
                  }
                }
              ]
            },
            {
              model: Policia,
              as: "policia",
              required: false,
              attributes: [
                "id",
                "grado",
                "comisaria"
              ],
              include: [
                {
                  model: Persona,
                  as: "persona",

                  attributes: [
                    "nombres",
                    "apellidos"
                  ]
                }
              ]
            }
          ]
        }
      ]
    });
  const data = rows.map(item => {

    const patrullaje = item.toJSON();

    const serenos = [];
    const policias = [];

    (patrullaje.personal || []).forEach(personal => {

      if (
        personal.tipo_personal === "SERENO" &&
        personal.usuario
      ) {

        serenos.push({
          id: personal.usuario.id,
          nombres: personal.usuario.persona?.nombres || "",
          apellidos: personal.usuario.persona?.apellidos || "",
          roles: personal.usuario.roles?.map(
            rol => rol.nombre
          ) || []
        });
      }

      if (personal.tipo_personal === "POLICIA" && personal.policia) {
        policias.push({
          id: personal.policia.id,
          grado: personal.policia.grado,
          comisaria: personal.policia.comisaria,
          nombres: personal.policia.persona?.nombres || "",
          apellidos: personal.policia.persona?.apellidos || ""
        });
      }
    });

    return {
      id: patrullaje.id,
      fecha: patrullaje.fecha,
      hora_inicio: patrullaje.hora_inicio,
      hora_fin: patrullaje.hora_fin,
      descripcion: patrullaje.descripcion,
      estado: patrullaje.estado,
      createdAt: patrullaje.createdAt,
      updatedAt: patrullaje.updatedAt,
      unidad: patrullaje.unidad,
      zona: patrullaje.zona,
      serenos,
      policias
    };
  });

  return {
    total: count,
    page,
    limit,
    totalPages: Math.ceil(count / limit),
    data
  };
};

module.exports = listarPatrullajesProgramadosService;