const { Op } = require("sequelize");

const db = require("../../../../database/models");

// Modelos
const { Usuario, Persona } = db;

// ACTUALIZAR MI PERFIL
const updateMyProfileService = async ({
  usuarioId,
  nombres,
  apellidos,
  telefono,
  direccion,
  departamento,
  provincia,
  distrito,
  correo
}) => {

  // Buscar usuario con su persona
  const usuario = await Usuario.findByPk(usuarioId, {
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

  // Validar correo duplicado (si cambió)
  if (correo && correo !== usuario.correo) {

    const existeCorreo = await Usuario.findOne({
      where: {
        correo,
        id: {
          [Op.ne]: usuarioId
        }
      }
    });

    if (existeCorreo) {
      throw new Error("El correo ya está registrado.");
    }

  }

  // Actualizar persona
  await usuario.persona.update({
    nombres,
    apellidos,
    telefono,
    direccion,
    departamento,
    provincia,
    distrito
  });

  // Actualizar usuario
  await usuario.update({
    correo
  });

  // Obtener datos actualizados
  const usuarioActualizado = await Usuario.findByPk(usuarioId, {
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

  return {
    message: "Perfil actualizado correctamente.",
    usuario: usuarioActualizado
  };

};

module.exports = updateMyProfileService;