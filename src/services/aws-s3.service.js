// src/services/s3.service.js
const { PutObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const s3 = require("../config/aws-s3");
require("dotenv").config();
const { v4: uuidv4 } = require("uuid");
const mime = require("mime-types");

// 1. SUBIR ARCHIVO A S3
const uploadFileToS3 = async ({
  file,
  categoria,
  entidadId,
  serenoId,
}) => {
  const extension = file.originalname.split(".").pop().toLowerCase();

  let tipoArchivo = "OTRO";

  if (["jpg", "jpeg", "png", "heic", "heif"].includes(extension)) {
    tipoArchivo = "IMAGEN";
  } else if (["mp4", "mov"].includes(extension)) {
    tipoArchivo = "VIDEO";
  } else if (extension === "pdf") {
    tipoArchivo = "PDF";
  }

  const key = `patrullaje-system/${categoria}/${entidadId}/evidencias/${serenoId}/${tipoArchivo}/${Date.now()}.${extension}`;

  const contentType = mime.lookup(file.originalname) || file.mimetype;

  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: key,
    Body: file.buffer,
    ContentType: contentType,
    // ACL: "public-read", // Para verlo en publico
  };

  await s3.send(new PutObjectCommand(params));

  return {
    url: `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`,
    key,
  };
};

// 2. ELIMINAR ARCHIVO DE S3
const deleteFileFromS3 = async (key) => {
  try {
    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key,
    };

    await s3.send(new DeleteObjectCommand(params));

    console.log("🗑️ Archivo eliminado de S3:", key);

  } catch (error) {
    console.error("❌ Error eliminando de S3:", error);
    throw error;
  }
};

module.exports = {
  uploadFileToS3,
  deleteFileFromS3
};
