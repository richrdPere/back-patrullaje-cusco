const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const db = require("../../../../database/models");

// Models
const { Usuario } = db;

// Reset Password Service
const resetPasswordService = async (
    token,
    nuevaPassword
) => {

    const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET
    );

    const usuario = await Usuario.findByPk(decoded.id);

    if (!usuario) {
        throw new Error("El usuario no existe.");
    }

    if (!usuario.estado) {
        throw new Error("El usuario se encuentra inactivo.");
    }

    const passwordHash = await bcrypt.hash(
        nuevaPassword,
        10
    );

    usuario.password = passwordHash;
    await usuario.save();
    return true;
};

module.exports = resetPasswordService;