const bcrypt = require("bcryptjs");
const { Op } = require("sequelize");

const db = require("../../../database/models");

// Models
const {
  sequelize,
  Usuario,
  Persona,
  Roles,
  UsuarioRol
} = db;

// Actualizar Usuario
const updateUsuarioService = async (id, data) => {

  const {
    roles,
    password,
    correo,
    estado,
    nombres,
    apellidos,
    telefono,
    direccion,
    departamento,
    provincia,
    distrito,
    documento_identidad
  } = data;

  return await sequelize.transaction(async (t) => {

    // ==========================
    // BUSCAR USUARIO
    // ==========================
    const usuario = await Usuario.findByPk(id, {
      include: [
        {
          model: Persona,
          as: "persona"
        }
      ],
      transaction: t
    });

    if (!usuario) {
      throw new Error("Usuario no encontrado.");
    }

    const persona = usuario.persona;

    // ==========================
    // VALIDAR DNI
    // ==========================
    if (
      documento_identidad &&
      documento_identidad !== persona.documento_identidad
    ) {

      const existeDNI = await Persona.findOne({
        where: {
          documento_identidad
        },
        transaction: t
      });

      if (existeDNI) {
        throw new Error("El DNI ya está registrado.");
      }
    }

    // ==========================
    // VALIDAR CORREO
    // ==========================
    if (correo && correo !== usuario.correo) {

      const existeCorreo = await Usuario.findOne({

        where: {
          correo,
          id: {
            [Op.ne]: id
          }
        },

        transaction: t

      });

      if (existeCorreo) {
        throw new Error("El correo ya está registrado.");
      }

    }

    // ==========================
    // ACTUALIZAR PERSONA
    // ==========================
    await persona.update({
      nombres,
      apellidos,
      telefono,
      direccion,
      departamento,
      provincia,
      distrito,
      documento_identidad

    }, {
      transaction: t
    });

    // ==========================
    // ACTUALIZAR USUARIO
    // ==========================
    const dataUsuario = {
      correo,
      estado
    };

    if (password) {
      dataUsuario.password = await bcrypt.hash(
        password,
        12
      );
    }

    await usuario.update(
      dataUsuario,
      {
        transaction: t
      }
    );

    // ==========================
    // ACTUALIZAR ROLES
    // ==========================
    if (roles && Array.isArray(roles)) {

      const rolesDB = await Roles.findAll({

        where: {
          nombre: {
            [Op.in]: roles
          }
        },

        transaction: t

      });

      if (rolesDB.length !== roles.length) {
        throw new Error("Uno o más roles no existen.");
      }

      await UsuarioRol.destroy({
        where: {
          usuario_id: id
        },
        transaction: t
      });

      const nuevosRoles = rolesDB.map(rol => ({
        usuario_id: id,
        rol_id: rol.id
      }));

      await UsuarioRol.bulkCreate(
        nuevosRoles,
        {
          transaction: t
        }
      );

    }
    return true;
  });
};

module.exports = updateUsuarioService;