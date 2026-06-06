const bcrypt = require("bcryptjs");
const authRepository = require("../repositories/auth.repository");
const { generarToken } = require("../../../utils/jwt");

// Register service
const registerService = async (data) => {

  const {
    username,
    correo,
    password
  } = data;

  if (username) {

    const existe =
      await authRepository.findByUsername(username);

    if (existe) {
      throw {
        status: 400,
        message: "El username ya está registrado"
      };
    }
  }

  if (correo) {

    const existeCorreo =
      await authRepository.findByEmail(correo);

    if (existeCorreo) {
      throw {
        status: 400,
        message: "El correo ya está registrado"
      };
    }
  }

  const salt =
    await bcrypt.genSalt(10);

  const passwordHash =
    await bcrypt.hash(password, salt);

  const usuario =
    await authRepository.createUser({
      ...data,
      password: passwordHash
    });

  const token =
    await generarToken({
      id: usuario.id
    });

  return {
    message: "Usuario registrado correctamente",
    token,
    usuario
  };
};

module.exports = registerService;