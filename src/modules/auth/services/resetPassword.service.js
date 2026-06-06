const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const authRepository = require("../repositories/auth.repository");

const resetPasswordService = async (
  token,
  nuevaPassword
) => {

  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  const usuario = await authRepository.findById(decoded.id);

  if (!usuario) {
    throw {
      status: 404,
      message: "Usuario no encontrado"
    };
  }

  const salt = await bcrypt.genSalt(10);

  usuario.password =
    await bcrypt.hash(
      nuevaPassword,
      salt
    );

  await usuario.save();

  return {
    message: "Contraseña actualizada correctamente"
  };
};

module.exports = resetPasswordService;