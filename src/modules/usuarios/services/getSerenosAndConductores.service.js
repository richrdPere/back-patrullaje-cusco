const { Op } = require("sequelize");

const db = require("../../../database/models");

// Models
const { Usuario, Persona, Roles } = db;


// Listar Srenos y Conductores
const getSerenosAndConductores = async () => {
  const usuarios = await Usuario.findAll({
    where: {
      estado: true
    },
    include: [
      {
        model: Persona,
        as: "persona",
        attributes: [
          "id",
          "nombres",
          "apellidos",
          "documento_identidad",
          "telefono"
        ],
        required: true
      },
      {
        model: Roles,
        as: "roles",
        attributes: ["nombre"],
        where: {
          nombre: {
            [Op.in]: ["SERENO", "CONDUCTOR"]
          }
        },
        through: {
          attributes: []
        },
        required: true
      }
    ],
    distinct: true
  });

  return usuarios.map(usuario => {
    const user = usuario.toJSON();

    return {
      id: user.id,
      username: user.username,
      estado: user.estado,

      persona: user.persona,

      roles: user.roles.map(r => r.nombre)
    };
  });

};

module.exports = getSerenosAndConductores;