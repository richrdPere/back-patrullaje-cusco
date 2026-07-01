const bcrypt = require("bcryptjs");
const { generarToken } = require("../../../utils/jwt");
const db = require("../../../database/models");

const {
  sequelize,
  Usuario,
  Persona,
  Roles,
  UsuarioRol
} = db;

// Register service
const registerService = async (data) => {

  const {
    username,
    correo,
    password,
    rol = "USUARIO",

    nombres,
    apellidos,
    documento_identidad,
    telefono,
    direccion,
    departamento,
    provincia,
    distrito,
    foto_perfil,
    foto_perfil_key
  } = data;

  // Validar username
  if (username) {

    const existeUsername = await Usuario.findOne({
      where: { username }
    });

    if (existeUsername) {
      throw new Error("El nombre de usuario ya está registrado.");
    }
  }

  // Validar correo
  if (correo) {

    const existeCorreo = await Usuario.findOne({
      where: { correo }
    });

    if (existeCorreo) {
      throw new Error("El correo ya está registrado.");
    }
  }

  // Validar documento
  const existeDocumento = await Persona.findOne({
    where: {
      documento_identidad
    }
  });

  if (existeDocumento) {
    throw new Error("El documento de identidad ya está registrado.");
  }

  // Buscar rol
  const rolBD = await Roles.findOne({
    where: {
      nombre: rol
    }
  });

  if (!rolBD) {
    throw new Error("El rol especificado no existe.");
  }

  // Encriptar contraseña
  const passwordHash = await bcrypt.hash(password, 10);

  // Transacción
  const resultado = await sequelize.transaction(async (t) => {

    const persona = await Persona.create({
      nombres,
      apellidos,
      documento_identidad,
      telefono,
      direccion,
      departamento,
      provincia,
      distrito,
      foto_perfil,
      foto_perfil_key
    }, { transaction: t });

    const usuario = await Usuario.create({
      persona_id: persona.id,
      username,
      correo,
      password: passwordHash,
      estado: true
    }, { transaction: t });

    await UsuarioRol.create({
      usuario_id: usuario.id,
      rol_id: rolBD.id
    }, { transaction: t });

    return usuario;
  });

  const usuario = await Usuario.findByPk(resultado.id, {
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

  const roles = usuario.roles.map(r => r.nombre);

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

module.exports = registerService;