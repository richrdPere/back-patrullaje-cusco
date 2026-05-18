const bcrypt = require("bcryptjs");
const db = require('../models');
const { uploadFileToS3, deleteFileFromS3 } = require("../services/aws-s3.service");

const Usuario = db.Usuario;
const Persona = db.Persona;

// ======================================================
// 1. OBTENER UN PERFIL
// ======================================================
const getMyProfile = async (req, res) => {
  try {
    const usuarioId = req.usuario.id;
    const usuario = await Usuario.findByPk(usuarioId, {
      attributes: {
        exclude: ["password"]
      },
      include: [
        {
          model: Persona,
          as: "persona"
        }
      ]
    });

    if (!usuario) {
      return res.status(404).json({
        message: "Usuario no encontrado"
      });
    }

    res.json(usuario);

  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Error al obtener perfil",
      error: error.message
    });
  }
};

// ======================================================
// 2. ACTUALIZAR UN PERFIL
// ======================================================
const updateMyProfile = async (req, res) => {
  try {

    const usuarioId = req.usuario.id;

    const {
      nombres,
      apellidos,
      telefono,
      direccion,
      departamento,
      provincia,
      distrito,
      correo
    } = req.body;

    const usuario = await Usuario.findByPk(usuarioId, {
      include: [
        {
          model: Persona,
          as: "persona"
        }
      ]
    });

    if (!usuario) {
      return res.status(404).json({
        message: "Usuario no encontrado"
      });
    }

    await usuario.persona.update({
      nombres,
      apellidos,
      telefono,
      direccion,
      departamento,
      provincia,
      distrito
    });

    await usuario.update({
      correo
    });

    res.json({
      message: "Perfil actualizado correctamente"
    });

  } catch (error) {

    res.status(500).json({
      message: "Error al actualizar perfil",
      error: error.message
    });

  }
};

// ======================================================
// 3. CAMBIAR CONTRASEÑA
// ======================================================
const changePassword = async (req, res) => {
  try {

    const usuarioId = req.usuario.id;

    const {
      password_actual,
      password_nueva
    } = req.body;

    const usuario = await Usuario.findByPk(usuarioId);

    const validPassword = await bcrypt.compare(
      password_actual,
      usuario.password
    );

    if (!validPassword) {
      return res.status(400).json({
        message: "La contraseña actual es incorrecta"
      });
    }

    const hashedPassword = await bcrypt.hash(password_nueva, 10);

    await usuario.update({
      password: hashedPassword
    });

    res.json({
      message: "Contraseña actualizada correctamente"
    });

  } catch (error) {

    res.status(500).json({
      message: "Error al cambiar contraseña",
      error: error.message
    });

  }
};

// ======================================================
// 4. SUBIR FOTO
// ======================================================
const uploadProfilePhoto = async (req, res) => {
  try {
    const usuarioId = req.usuario.id;

    // - VALIDAR ARCHIVO
    if (!req.file) {
      return res.status(400).json({
        message: "No se envió ninguna imagen"
      });
    }

    // - BUSCAR USUARIO
    const usuario = await Usuario.findByPk(usuarioId, {
      include: [
        {
          model: Persona,
          as: "persona"
        }
      ]
    });

    if (!usuario) {
      return res.status(404).json({
        message: "Usuario no encontrado"
      });
    }

    // - ELIMINAR FOTO ANTERIOR
    if (usuario.persona.foto_perfil_key) {
      await deleteFileFromS3(
        usuario.persona.foto_perfil_key
      );
    }

    // - GENERAR EXTENSION
    const extension = path.extname(
      req.file.originalname
    ).toLowerCase();

    const customKey =
      `patrullaje-system/profile/${usuario.persona.id}/avatar-${Date.now()}${extension}`;

    // - SUBIR NUEVA FOTO
    const uploadResult = await uploadFileToS3({
      file: req.file,
      customKey
    });

    // - GUARDAR EN DB
    await usuario.persona.update({
      foto_perfil: uploadResult.url,
      foto_perfil_key: uploadResult.key
    });

    // - RESPUESTA
    res.json({
      message: "Foto de perfil actualizada correctamente",
      foto_perfil: uploadResult.url
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Error al subir foto de perfil",
      error: error.message
    });
  }
};

module.exports = {
  getMyProfile,
  updateMyProfile,
  changePassword,
  uploadProfilePhoto
};