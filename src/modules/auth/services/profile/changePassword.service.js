const bcrypt = require("bcryptjs");

const db = require("../../../../database/models");

// Modelos
const { Usuario } = db;


// CAMBIAR CONTRASEÑA
const changePasswordService = async ({
    usuarioId,
    password_actual,
    password_nueva
}) => {

    // Buscar usuario
    const usuario = await Usuario.findByPk(usuarioId);

    if (!usuario) {
        throw new Error("Usuario no encontrado.");
    }

    // Validar contraseña actual
    const passwordValida = await bcrypt.compare(
        password_actual,
        usuario.password
    );

    if (!passwordValida) {
        throw new Error("La contraseña actual es incorrecta.");
    }

    // Evitar reutilizar la misma contraseña
    const mismaPassword = await bcrypt.compare(
        password_nueva,
        usuario.password
    );

    if (mismaPassword) {
        throw new Error("La nueva contraseña debe ser diferente de la actual.");
    }

    // Encriptar nueva contraseña
    const passwordHash = await bcrypt.hash(password_nueva, 10);

    // Actualizar
    await usuario.update({
        password: passwordHash
    });

    return {
        message: "Contraseña actualizada correctamente."
    };

};

module.exports = changePasswordService;