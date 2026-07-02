const db = require("../../../../database/models");

// Modelos
const { PatrullajeProgramado, UnidadPatrullaje, Zonas } = db;

// Listar todos los patrullajes programados
const getPatrullajesPAllService = async () => {

  const patrullajes = await PatrullajeProgramado.findAll({

    include: [
      {
        model: UnidadPatrullaje,
        as: "unidad"
      },
      {
        model: Zonas,
        as: "zona"
      }
    ],
    order: [
      ["fecha", "DESC"]
    ]
  });
  return {
    total: patrullajes.length,
    data: patrullajes
  };
};

module.exports = getPatrullajesPAllService;