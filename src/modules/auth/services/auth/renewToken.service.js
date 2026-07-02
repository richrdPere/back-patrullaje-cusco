const { generarToken } = require("../../../../utils/jwt");
const db = require("../../../../database/models");

// Modelos
const { Usuario, Persona, Roles } = db;

// Renew Token Service
const renewTokenService = async (userId) => {

  const usuario = await Usuario.findByPk(userId, {
    include: [
      {
        model: Persona,
        as: "persona",
        attributes: {
          exclude: ["createdAt", "updatedAt"]
        }
      },
      {
        model: Roles,
        as: "roles",
        attributes: ["id", "nombre"],
        through: {
          attributes: []
        }
      }
    ]
  });

  if (!usuario) {
    throw new Error("El usuario no existe.");
  }

  if (!usuario.estado) {
    throw new Error("El usuario se encuentra inactivo.");
  }

  const roles = usuario.roles?.map(rol => rol.nombre) || [];

  const token = await generarToken({
    id: usuario.id,
    username: usuario.username,
    correo: usuario.correo,
    roles
  });

  return {
    token,
    roles,
    usuario: {
      id: usuario.id,
      username: usuario.username,
      correo: usuario.correo,
      estado: usuario.estado,
      persona: usuario.persona
    }
  };

};

module.exports = renewTokenService;