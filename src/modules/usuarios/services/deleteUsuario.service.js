const db = require("../../../database/models");

// Models
const {
  sequelize,
  Usuario,
  Persona,
  UsuarioRol
} = db;

// Eliminar Usuario
const deleteUsuarioService = async (id) => {

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

    const personaId = usuario.persona_id;

    // ==========================
    // ELIMINAR ROLES
    // ==========================
    await UsuarioRol.destroy({
      where: {
        usuario_id: id
      },
      transaction: t
    });

    // ==========================
    // ELIMINAR USUARIO
    // ==========================
    await usuario.destroy({
      transaction: t
    });

    // ==========================
    // ELIMINAR PERSONA
    // ==========================
    await Persona.destroy({
      where: { id: personaId },
      transaction: t

    });
    return true;
  });
};

module.exports = deleteUsuarioService;