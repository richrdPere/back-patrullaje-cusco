const jwt = require("jsonwebtoken");
const authRepository = require("../repositories/auth.repository");

const confirmAccountService = async (token) => {

  const decoded =
    jwt.verify(token, process.env.JWT_SECRET);

  const usuario =
    await authRepository.findById(decoded.id);

  if (!usuario) {
    throw {
      status: 404,
      message: "Usuario no encontrado"
    };
  }

  usuario.estado = true;

  await usuario.save();

  return {
    message: "Cuenta confirmada correctamente"
  };
};

module.exports = confirmAccountService;