const { Op } = require("sequelize");
const path = require("path");
const { uploadFileToS3, deleteFileFromS3 } = require("../../../services/aws-s3.service")

// Modelos
const db = require("../../../database/models");

const { sequelize, Incidencia, IncidenciaArchivo, PatrullajeProgramado, Usuario, Zonas, PatrullajePersonal } = db;

// ======================================================
// CONSTANTES
// ======================================================
const TIPOS_VALIDOS = [
  "ROBO",
  "ACCIDENTE",
  "INCENDIO",
  "VIOLENCIA",
  "SOSPECHOSO",
  "OTRO",
];

const EXTENSIONES_IMAGEN = [
  ".jpg",
  ".jpeg",
  ".png",
  ".heic",
  ".heif",
];

const EXTENSIONES_VIDEO = [
  ".mp4",
  ".mov",
];

const MAX_ARCHIVOS = 5;

// ======================================================
// HELPERS
// ======================================================
const createHttpError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const normalizarArchivos = (files) => {
  if (!files) return [];

  if (Array.isArray(files)) {
    return files;
  }

  if (typeof files === "object") {
    return Object.values(files).flat();
  }

  return [];
};

const getTipoArchivo = (file) => {
  const mime = file?.mimetype?.toLowerCase() || "";

  const extension = path
    .extname(file?.originalname || "")
    .toLowerCase();

  if (
    mime.startsWith("image/") ||
    EXTENSIONES_IMAGEN.includes(extension)
  ) {
    return "IMAGEN";
  }

  if (
    mime.startsWith("video/") ||
    EXTENSIONES_VIDEO.includes(extension)
  ) {
    return "VIDEO";
  }

  return "OTRO";
};

const validarCoordenadas = (latitud, longitud) => {
  if (
    latitud === undefined ||
    latitud === null ||
    longitud === undefined ||
    longitud === null
  ) {
    throw createHttpError(
      "La latitud y longitud son obligatorias.",
      400
    );
  }

  const lat = Number.parseFloat(latitud);
  const lng = Number.parseFloat(longitud);

  if (
    Number.isNaN(lat) ||
    Number.isNaN(lng) ||
    lat < -90 ||
    lat > 90 ||
    lng < -180 ||
    lng > 180
  ) {
    throw createHttpError(
      "Las coordenadas proporcionadas no son válidas.",
      400
    );
  }

  return {
    lat,
    lng,
  };
};

const validarArchivos = (archivos) => {
  if (archivos.length > MAX_ARCHIVOS) {
    throw createHttpError(
      `Solo se permiten hasta ${MAX_ARCHIVOS} archivos.`,
      400
    );
  }

  for (const file of archivos) {
    const tipoArchivo = getTipoArchivo(file);

    if (tipoArchivo === "OTRO") {
      throw createHttpError(
        `El archivo ${file.originalname} no tiene un formato permitido.`,
        400
      );
    }
  }
};

const limpiarArchivosS3 = async (archivosSubidos) => {
  if (!archivosSubidos.length) return;

  await Promise.allSettled(
    archivosSubidos.map(async (archivo) => {
      if (!archivo?.key) return;

      try {
        /*
         * Ajusta esta llamada si tu función recibe:
         *
         * deleteFileFromS3(archivo.key)
         *
         * en lugar de:
         *
         * deleteFileFromS3({ key: archivo.key })
         */
        await deleteFileFromS3({
          key: archivo.key,
        });
      } catch (error) {
        console.error(
          `No se pudo eliminar el archivo S3 ${archivo.key}:`,
          error
        );
      }
    })
  );
};

// ======================================================
// SERVICE
// ======================================================
const registerIncidenciaService = async ({
  usuario_id,
  body,
  files,
}) => {
  const {
    patrullaje_id,
    tipo,
    descripcion,
    latitud,
    longitud,
  } = body;

  // ====================================================
  // VALIDACIONES BÁSICAS
  // ====================================================
  const usuarioId = Number(usuario_id);
  const patrullajeId = Number(patrullaje_id);

  if (!Number.isInteger(usuarioId) || usuarioId <= 0) {
    throw createHttpError(
      "El usuario autenticado no es válido.",
      401
    );
  }

  if (!Number.isInteger(patrullajeId) || patrullajeId <= 0) {
    throw createHttpError(
      "La incidencia debe estar asociada a un patrullaje activo.",
      400
    );
  }

  const descripcionFinal = descripcion?.toString().trim();

  if (!descripcionFinal) {
    throw createHttpError(
      "La descripción de la incidencia es obligatoria.",
      400
    );
  }

  const tipoFinal = tipo
    ?.toString()
    .trim()
    .toUpperCase();

  if (!TIPOS_VALIDOS.includes(tipoFinal)) {
    throw createHttpError(
      "El tipo de incidencia no es válido.",
      400
    );
  }

  const {
    lat,
    lng,
  } = validarCoordenadas(
    latitud,
    longitud
  );

  const archivos = normalizarArchivos(files);

  validarArchivos(archivos);

  // Almacena resultados para limpiarlos de S3 ante errores.
  const archivosSubidos = [];

  const transaction = await sequelize.transaction();

  try {
    // ==================================================
    // VALIDAR USUARIO
    // ==================================================
    const usuario = await Usuario.findByPk(
      usuarioId,
      {
        transaction,
      }
    );

    if (!usuario) {
      throw createHttpError(
        "El usuario autenticado no existe.",
        404
      );
    }

    // ==================================================
    // VALIDAR PATRULLAJE
    // ==================================================
    const patrullaje = await PatrullajeProgramado.findByPk(
      patrullajeId,
      {
        transaction,
      }
    );

    if (!patrullaje) {
      throw createHttpError(
        "El patrullaje indicado no existe.",
        404
      );
    }

    if (patrullaje.estado !== "EN_CURSO") {
      throw createHttpError(
        "Solo se pueden registrar incidencias durante un patrullaje en curso.",
        400
      );
    }

    // ==================================================
    // VALIDAR ASIGNACIÓN DEL SERENO
    // ==================================================
    const asignacion = await PatrullajePersonal.findOne({
      where: {
        patrullaje_id: patrullajeId,
        usuario_id: usuarioId,
        tipo_personal: "SERENO",
        estado: "EN_SERVICIO",
      },
      transaction,
    });

    if (!asignacion) {
      throw createHttpError(
        "No perteneces al patrullaje indicado o no te encuentras en servicio.",
        403
      );
    }

    // ==================================================
    // OBTENER Y VALIDAR ZONA DESDE EL PATRULLAJE
    // ==================================================
    const zonaId = Number(patrullaje.zona_id);

    if (!Number.isInteger(zonaId) || zonaId <= 0) {
      throw createHttpError(
        "El patrullaje no tiene una zona válida asignada.",
        400
      );
    }

    const zona = await Zonas.findByPk(
      zonaId,
      {
        transaction,
      }
    );

    if (!zona) {
      throw createHttpError(
        "La zona asignada al patrullaje no existe.",
        404
      );
    }

    // ==================================================
    // CREAR INCIDENCIA
    // ==================================================
    const incidencia = await Incidencia.create(
      {
        usuario_id: usuarioId,
        patrullaje_id: patrullajeId,
        zona_id: zonaId,

        tipo: tipoFinal,
        descripcion: descripcionFinal,

        latitud: lat,
        longitud: lng,

        origen: "APP_MOVIL",
        estado: "REPORTADO",
        total_evidencias: 0,
      },
      {
        transaction,
      }
    );

    // ==================================================
    // SUBIR EVIDENCIAS
    // ==================================================
    const archivosData = [];

    /*
     * Se realiza secuencialmente para conservar cada resultado
     * exitoso y poder eliminarlo si una subida posterior falla.
     */
    for (const file of archivos) {
      const resultado = await uploadFileToS3({
        file,
        categoria: "incidencias",
        entidadId: incidencia.id,
        serenoId: usuarioId,
      });

      archivosSubidos.push(resultado);

      archivosData.push({
        incidencia_id: incidencia.id,
        url_archivo: resultado.url,
        key_s3: resultado.key,
        tipo_archivo: getTipoArchivo(file),
        mime_type: file.mimetype,
        peso: file.size,
        sereno_id: usuarioId,
      });
    }

    // ==================================================
    // GUARDAR METADATOS DE EVIDENCIA
    // ==================================================
    if (archivosData.length > 0) {
      await IncidenciaArchivo.bulkCreate(
        archivosData,
        {
          transaction,
        }
      );

      incidencia.total_evidencias =
        archivosData.length;

      await incidencia.save({
        transaction,
      });
    }

    await transaction.commit();

    return {
      incidencia,
      archivos: archivosData,
    };
  } catch (error) {
    try {
      await transaction.rollback();
    } catch (rollbackError) {
      console.error(
        "Error al revertir la transacción:",
        rollbackError
      );
    }

    await limpiarArchivosS3(
      archivosSubidos
    );

    throw error;
  }
};

module.exports = registerIncidenciaService;
