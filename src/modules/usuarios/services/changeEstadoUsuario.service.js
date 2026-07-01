const db = require("../../../database/models");

// Models
const { Usuario, Persona } = db;

// Cambiar Estado Usuario
const changeEstadoUsuarioService = async (id, estado) => {

    // ==========================
    // VALIDAR INPUT
    // ==========================

    if (typeof estado !== "boolean") {
        throw new Error(
            "El estado debe ser booleano (true o false)."
        );
    }

    // ==========================
    // BUSCAR USUARIO
    // ==========================
    const usuario = await Usuario.findByPk(id, {

        include: [
            {
                model: Persona,
                as: "persona",

                attributes: [
                    "id",
                    "nombres",
                    "apellidos",
                    "documento_identidad"
                ]
            }
        ]
    });

    if (!usuario) {
        throw new Error("Usuario no encontrado.");
    }

    // ==========================
    // VALIDAR ESTADO
    // ==========================
    if (usuario.estado === estado) {
        throw new Error(
            estado
                ? "El usuario ya se encuentra activo."
                : "El usuario ya se encuentra desactivado."
        );
    }

    // ==========================
    // ACTUALIZAR
    // ==========================
    usuario.estado = estado;
    await usuario.save();
    return {
        id: usuario.id,
        username: usuario.username,
        estado: usuario.estado,
        persona: usuario.persona
    };
};

module.exports = changeEstadoUsuarioService;