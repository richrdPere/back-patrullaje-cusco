const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../models");
const { generarToken } = require("../utils/jwt");

const Usuario = db.Usuario;
const Roles = db.Roles;


// *************************************************
// 🔹 Login
// *************************************************
const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // 1. Validar entrada
    if (!username || !password) {
      return res.status(400).json({
        message: "Debe ingresar username y contraseña",
      });
    }

    // 2. Buscar usuario con roles
    const usuario = await Usuario.findOne({
      where: { username },
      include: [
        {
          model: Roles,
          as: "roles",
          attributes: ["nombre"],
          through: { attributes: [] },
        },
      ],
    });

    if (!usuario) {
      return res.status(404).json({
        message: "Usuario no encontrado",
      });
    }

    // 3. Verificar estado
    if (!usuario.estado) {
      return res.status(403).json({
        message: "Usuario deshabilitado",
      });
    }

    // 4. Comparar password
    const passwordValido = await bcrypt.compare(password, usuario.password);

    if (!passwordValido) {
      return res.status(401).json({
        message: "Contraseña incorrecta",
      });
    }
    // EXTRAER ROLES COMO ARRAY
    const roles = usuario.roles.map((r) => r.nombre) || [];

    // 5. Generar JWT
    const token = await generarToken(usuario.id);

    // 6. Respuesta
    res.json({
      message: "Login exitoso",
      token,
      roles,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        apellidos: usuario.apellidos,
        username: usuario.username,
        telefono: usuario.telefono,
        direccion: usuario.direccion,
        distrito: usuario.distrito,
        provincia: usuario.provincia,
        departamento: usuario.departamento,
        online: usuario.online,
        foto_perfil: usuario.foto_perfil
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Error en login",
      error: error.message,
    });
  }
};

// *************************************************
// 🔹 Confirmar Cuenta
// *************************************************
const confirmarCuenta = async (req, res) => {
  try {

    const { token } = req.params;

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const usuario = await Usuario.findByPk(decoded.id);

    if (!usuario) {
      return res.status(404).json({
        message: "Usuario no encontrado",
      });
    }

    usuario.estado = true;

    await usuario.save();

    res.json({
      message: "Cuenta confirmada correctamente",
    });

  } catch (error) {

    res.status(400).json({
      message: "Token inválido o expirado",
      error: error.message,
    });

  }
};

// *************************************************
// 🔹 Recuperar Cuenta
// *************************************************
const recuperarCuenta = async (req, res) => {

  try {

    const { username } = req.body;

    if (!username) {
      return res.status(400).json({
        message: "Debe enviar el username",
      });
    }

    const usuario = await Usuario.findOne({
      where: { username }
    });

    if (!usuario) {
      return res.status(404).json({
        message: "Usuario no encontrado",
      });
    }

    const token = jwt.sign(
      { id: usuario.id },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    res.json({
      message: "Token de recuperación generado",
      token
    });

  } catch (error) {

    res.status(500).json({
      message: "Error al recuperar cuenta",
      error: error.message,
    });
  }
};

// *************************************************
//  Resetear Contraseña
// *************************************************
const resetPassword = async (req, res) => {

  try {

    const { token } = req.params;
    const { nuevaPassword } = req.body;

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const usuario = await Usuario.findByPk(decoded.id);

    if (!usuario) {
      return res.status(404).json({
        message: "Usuario no encontrado",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(nuevaPassword, salt);

    usuario.password = passwordHash;

    await usuario.save();

    res.json({
      message: "Contraseña actualizada correctamente",
    });

  } catch (error) {

    res.status(400).json({
      message: "Token inválido o expirado",
      error: error.message,
    });

  }
};

// *************************************************
//  Registrar Usuario
// *************************************************
const register = async (req, res) => {
  try {
    const {
      nombre,
      apellidos,
      username,
      password,
      correo,
      telefono,
      documento_identidad,
      direccion,
      departamento,
      provincia,
      distrito
    } = req.body;

    // Validación básica
    if (!nombre || !apellidos || !password || !documento_identidad) {
      return res.status(400).json({
        message: "Los campos obligatorios no fueron enviados",
      });
    }

    // Verificar si ya existe usuario por username o correo
    if (username) {
      const existeUsername = await Usuario.findOne({ where: { username } });
      if (existeUsername) {
        return res.status(400).json({
          message: "El username ya está en uso",
        });
      }
    }

    if (correo) {
      const existeCorreo = await Usuario.findOne({ where: { correo } });
      if (existeCorreo) {
        return res.status(400).json({
          message: "El correo ya está registrado",
        });
      }
    }

    // Encriptar contraseña
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Crear usuario
    const nuevoUsuario = await Usuario.create({
      nombre,
      apellidos,
      username,
      password: passwordHash,
      correo,
      telefono,
      documento_identidad,
      direccion,
      departamento,
      provincia,
      distrito
    });

    // Generar JWT de confirmación
    const token = await generarToken(nuevoUsuario.id);


    // Respuesta (sin password)
    return res.status(201).json({
      message: "Usuario registrado correctamente",
      token,
      usuario: {
        id: nuevoUsuario.id,
        nombre: nuevoUsuario.nombre,
        apellidos: nuevoUsuario.apellidos,
        username: nuevoUsuario.username,
        correo: nuevoUsuario.correo,
      },
    });

  } catch (error) {
    console.error("Error en register:", error);

    return res.status(500).json({
      message: "Error al registrar usuario",
      error: error.message,
    });
  }
};


// *************************************************
//  Renew Usuario
// *************************************************
const renewToken = async (req, res) => {
  try {

    // Ya viene del middleware
    const { id } = req.usuario;

    // Buscar usuario
    const usuario = await Usuario.findByPk(id);

    if (!usuario) {
      return res.status(401).json({
        message: "Usuario no existe",
      });
    }

    if (!usuario.estado) {
      return res.status(401).json({
        message: "Usuario inactivo",
      });
    }

    // Generar nuevo token
    const newToken = await generarToken(usuario.id);

    return res.json({
      message: "Token renovado correctamente",
      token: newToken,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        correo: usuario.correo,
      },
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Error al renovar token",
    });
  }
};


module.exports = {
  login,
  confirmarCuenta,
  recuperarCuenta,
  resetPassword,
  register,
  renewToken
};
