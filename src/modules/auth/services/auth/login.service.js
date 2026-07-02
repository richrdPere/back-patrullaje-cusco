const bcrypt = require("bcryptjs");
const { generarToken } = require("../../../../utils/jwt");

const db = require("../../../../database/models");

// Modelos
const { Usuario, Persona, Roles } = db;

// Login service
const loginService = async ({ username, password }) => {

  const usuario = await Usuario.findOne({
    where: { username },
    include: [
      {
        model: Persona, as: "persona", attributes: {
          exclude: ["createdAt", "updatedAt"]
        }
      },
      {
        model: Roles, as: "roles", attributes: ["id", "nombre"], through: { attributes: [] }
      }
    ]
  });

  if (!usuario) {
    throw new Error("Usuario o contraseña incorrectos.");
  }

  if (!usuario.estado) {
    throw new Error("El usuario se encuentra inactivo.");
  }

  const coincide = await bcrypt.compare(password, usuario.password);

  if (!coincide) {
    throw new Error("Usuario o contraseña incorrectos.");
  }

  const roles =
    usuario.roles?.map(r => r.nombre) || [];

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

module.exports = loginService;