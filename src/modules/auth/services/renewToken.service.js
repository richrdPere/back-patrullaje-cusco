const authRepository = require("../repositories/auth.repository");
const { generarToken } = require("../../../utils/jwt");

const renewTokenService = async (userId) => {

  const usuario = await authRepository.findById(userId);

  if (!usuario) {
    throw {
      status: 401,
      message: "Usuario no existe"
    };
  }

  if (!usuario.estado) {
    throw {
      status: 401,
      message: "Usuario inactivo"
    };
  }

  const token =
    await generarToken({
      id: usuario.id
    });

  return {
    message: "Token renovado correctamente",
    token
  };
};

module.exports = renewTokenService;