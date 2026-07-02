const jwt = require("jsonwebtoken");

const db = require("../../../../database/models");

// Models
const { Usuario } = db;

// Recover Account Service
const recoverAccountService = async (username) => {

  const usuario = await Usuario.findOne({
    where: {
      username
    }
  });

  if (!usuario) {
    throw new Error("El usuario no existe.");
  }

  if (!usuario.estado) {
    throw new Error("El usuario se encuentra inactivo.");
  }

  const token = jwt.sign(
    {
      id: usuario.id
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "15m"
    }
  );

  return {
    token
  };

};

module.exports = recoverAccountService;