const jwt = require("jsonwebtoken");
const authRepository = require("../repositories/auth.repository");

const recoverAccountService = async (username) => {

  const usuario =
    await authRepository.findByUsername(username);

  if (!usuario) {
    throw {
      status: 404,
      message: "Usuario no encontrado"
    };
  }

  const token =
    jwt.sign(
      { id: usuario.id },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

  return {
    message: "Token generado",
    token
  };
};

module.exports = recoverAccountService;