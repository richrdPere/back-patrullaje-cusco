const bcrypt = require("bcryptjs");
const authRepository = require("../repositories/auth.repository");
const { generarToken } = require("../../../utils/jwt");

// Login service
const loginService = async ({ username, password }) => {

  const usuario = await authRepository.findByUsername(username);

  if (!usuario) {
    throw {
      status: 404,
      message: "Usuario no encontrado"
    };
  }

  if (!usuario.estado) {
    throw {
      status: 403,
      message: "Usuario deshabilitado"
    };
  }

  const passwordValido =
    await bcrypt.compare(
      password,
      usuario.password
    );

  if (!passwordValido) {
    throw {
      status: 401,
      message: "Contraseña incorrecta"
    };
  }

  const roles =
    usuario.roles?.map(r => r.nombre) || [];

  const token = await generarToken({
    id: usuario.id,
    username: usuario.username,
    correo: usuario.correo,
    roles
  });

  return {
    message: "Login exitoso",
    token,
    roles,
    usuario: {
      id: usuario.id,
      username: usuario.username,
      correo: usuario.correo,
      estado: usuario.estado,
      persona: usuario.persona
    }
  };
};

module.exports = loginService;