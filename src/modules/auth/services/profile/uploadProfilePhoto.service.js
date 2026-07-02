const path = require("path");

const db = require("../../../../database/models");

const {
  uploadFileToS3,
  deleteFileFromS3
} = require("../../../../services/aws-s3.service");

// Modelos
const { Usuario, Persona } = db;

// SUBIR FOTO DE PERFIL
const uploadProfilePhotoService = async ({
  usuarioId,
  file
}) => {

  // Validar archivo
  if (!file) {
    throw new Error("No se envió ninguna imagen.");
  }

  // Buscar usuario
  const usuario = await Usuario.findByPk(usuarioId, {
    include: [
      {
        model: Persona,
        as: "persona"
      }
    ]
  });

  if (!usuario) {
    throw new Error("Usuario no encontrado.");
  }

  // Eliminar foto anterior (si existe)
  if (usuario.persona.foto_perfil_key) {

    try {
      await deleteFileFromS3(
        usuario.persona.foto_perfil_key
      );
    } catch (error) {
      console.warn(
        "No se pudo eliminar la foto anterior:",
        error.message
      );
    }

  }

  // Obtener extensión
  const extension = path
    .extname(file.originalname)
    .toLowerCase();

  // Key personalizada
  const customKey =
    `patrullaje-system/profile/${usuario.persona.id}/avatar-${Date.now()}${extension}`;

  // Subir archivo
  const uploadResult = await uploadFileToS3({
    file,
    customKey
  });

  // Guardar en BD
  await usuario.persona.update({
    foto_perfil: uploadResult.url,
    foto_perfil_key: uploadResult.key
  });

  return {
    message: "Foto de perfil actualizada correctamente.",
    foto_perfil: uploadResult.url
  };

};

module.exports = uploadProfilePhotoService;