const db = require("../../../../database/models");

// Modelo
const { Usuario, Persona } = db;

const getMyProfileService = async (usuarioId) => {

  const usuario = await Usuario.findByPk(usuarioId, {
    attributes: {
      exclude: ["password"]
    },
    include: [
      {
        model: Persona,
        as: "persona"
      }
    ]
  });

  if (!usuario) {
    throw new Error("Usuario no encontrado.");
  }

  return usuario;
};

module.exports = getMyProfileService;