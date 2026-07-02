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

// Obtener Patrullaje Programado por ID
const getPatrullajePByIdService = async (id) => {

  const patrullaje =
    await PatrullajeProgramado.findByPk(id, {
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

  if (!patrullaje) {
    throw new Error("Patrullaje no encontrado.");
  }

  const data = patrullaje.toJSON();

  const serenos = [];
  const policias = [];

  (data.personal || []).forEach(item => {

    if (
      item.tipo_personal === "SERENO" &&
      item.usuario
    ) {
      serenos.push({
        id: item.usuario.id,
        nombres: item.usuario.persona?.nombres || "",
        apellidos: item.usuario.persona?.apellidos || "",
        roles: item.usuario.roles?.map(
          r => r.nombre
        ) || []
      });
    }

    if (
      item.tipo_personal === "POLICIA" &&
      item.policia
    ) {

      policias.push({
        id: item.policia.id,
        grado: item.policia.grado,
        comisaria: item.policia.comisaria,
        nombres: item.policia.persona?.nombres || "",
        apellidos: item.policia.persona?.apellidos || ""
      });
    }
  });

  return {
    id: data.id,
    fecha: data.fecha,
    hora_inicio: data.hora_inicio,
    hora_fin: data.hora_fin,
    descripcion: data.descripcion,
    estado: data.estado,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
    unidad: data.unidad,
    zona: data.zona,
    serenos,
    policias
  };
};

module.exports = getPatrullajePByIdService;