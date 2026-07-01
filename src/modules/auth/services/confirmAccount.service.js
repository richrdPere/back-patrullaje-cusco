const jwt = require("jsonwebtoken");
const db = require("../../../database/models");

// Models
const { Usuario } = db;

// Confirm Account Service
const confirmAccountService = async (token) => {

  const decoded = jwt.verify(
    token,
    process.env.JWT_SECRET
  );

  const usuario = await Usuario.findByPk(decoded.id);

  if (!usuario) {
    throw new Error("El usuario no existe.");
  }

  if (usuario.estado) {
    throw new Error("La cuenta ya se encuentra activa.");
  }
  
  usuario.estado = true;
  await usuario.save();
  return true;
};

module.exports = confirmAccountService;