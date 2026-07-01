const { Op, fn, col, where } = require("sequelize");

const db = require("../../../database/models");

// Models
const {
  Usuario,
  Persona,
  Roles
} = db;

// Listar Usuarios
const getUsuariosService = async (query) => {

  const {
    page = 1,
    limit = 5,
    nombres = "",
    dni = "",
    rol
  } = query;

  const offset = (page - 1) * limit;

  // ==========================
  // FILTROS PERSONA
  // ==========================

  const wherePersona = {};
  const filtrosPersona = [];

  if (nombres) {

    filtrosPersona.push(
      where(
        fn(
          "concat",
          col("persona.nombres"),
          " ",
          col("persona.apellidos")
        ),
        {
          [Op.like]: `%${nombres.trim()}%`
        }
      )
    );

  }

  if (dni) {

    filtrosPersona.push({
      documento_identidad: {
        [Op.like]: `%${dni.trim()}%`
      }
    });

  }

  if (filtrosPersona.length > 0) {
    wherePersona[Op.and] = filtrosPersona;
  }

  // ==========================
  // INCLUDE PERSONA
  // ==========================

  const includePersona = {

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
      "updatedAt"
    ],

    required: true,
    where: wherePersona

  };

  // ==========================
  // INCLUDE ROLES
  // ==========================

  const includeRoles = {

    model: Roles,
    as: "roles",

    attributes: [
      "id",
      "nombre"
    ],

    through: {
      attributes: []
    },

    required: true

  };

  if (rol) {

    includeRoles.where = {
      nombre: rol
    };

  } else {

    includeRoles.where = {
      nombre: {
        [Op.ne]: "POLICIA"
      }
    };
  }

  // ==========================
  // CONSULTA
  // ==========================

  const { count, rows } = await Usuario.findAndCountAll({

    limit: Number(limit),
    offset: Number(offset),

    attributes: {
      exclude: [
        "password"
      ]
    },

    include: [
      includePersona,
      includeRoles
    ],

    order: [
      ["createdAt", "DESC"]
    ],

    distinct: true

  });

  return {
    total: count,
    page: Number(page),
    limit: Number(limit),
    totalPages: Math.ceil(count / limit),
    data: rows.map(usuario => {

      const user = usuario.toJSON();

      return {
        id: user.id,
        username: user.username,
        correo: user.correo,
        estado: user.estado,

        createdAt: user.createdAt,
        updatedAt: user.updatedAt,

        persona: user.persona,

        roles: user.roles?.map(
          r => r.nombre
        ) || []
      };
    })
  };
};

module.exports = getUsuariosService;