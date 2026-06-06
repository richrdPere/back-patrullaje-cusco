const db = require("../../../models");

const Usuario = db.Usuario;
const Roles = db.Roles;
const Persona = db.Persona;

const findByUsername = async (username) => {
  return Usuario.findOne({
    where: { username },
    include: [
      {
        model: Persona,
        as: "persona",
        attributes: [
          "id",
          "nombres",
          "apellidos",
          "documento_identidad",
          "telefono",
          "direccion",
          "departamento",
          "provincia",
          "distrito",
          "foto_perfil",
        ],
      },
      {
        model: Roles,
        as: "roles",
        attributes: ["nombre"],
        through: { attributes: [] },
      },
    ],
  });
};

const findById = async (id) => {
  return Usuario.findByPk(id);
};

const findByEmail = async (correo) => {
  return Usuario.findOne({
    where: { correo },
  });
};

const createUser = async (data) => {
  return Usuario.create(data);
};

module.exports = {
  findByUsername,
  findById,
  findByEmail,
  createUser,
};