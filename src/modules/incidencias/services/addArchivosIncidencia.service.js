const db = require("../../../database/models");
const { uploadFileToS3 } = require("../../../services/aws-s3.service");

// Modelos
const {
  sequelize,
  Incidencia,
  IncidenciaArchivo
} = db;

const getTipoArchivo = (mime) => {
  if (!mime) return "OTRO";
  if (mime.startsWith("image/")) return "IMAGEN";
  if (mime.startsWith("video/")) return "VIDEO";
  if (mime === "application/pdf") return "PDF";
  return "OTRO";
};

const normalizarArchivos = (files) => {
  if (Array.isArray(files)) return files;
  if (files) return Object.values(files).flat();
  return [];
};

/*
|--------------------------------------------------------------------------
| Agregar Archivos a Incidencia Existente
|--------------------------------------------------------------------------
*/
const addArchivosIncidenciaService = async ({
  incidencia_id,
  usuario_id,
  files,
}) => {
  const t = await sequelize.transaction();

  try {
    if (!incidencia_id || isNaN(incidencia_id)) {
      const error = new Error("ID de incidencia inválido");
      error.statusCode = 400;
      throw error;
    }

    const incidencia = await Incidencia.findByPk(incidencia_id, {
      transaction: t,
    });

    if (!incidencia) {
      const error = new Error("Incidencia no encontrada");
      error.statusCode = 404;
      throw error;
    }

    if (incidencia.estado === "ELIMINADO") {
      const error = new Error("No se puede agregar archivos a una incidencia eliminada");
      error.statusCode = 400;
      throw error;
    }

    const archivos = normalizarArchivos(files);

    if (archivos.length === 0) {
      const error = new Error("Debe adjuntar al menos un archivo");
      error.statusCode = 400;
      throw error;
    }

    const evidenciasActuales = await IncidenciaArchivo.count({
      where: {
        incidencia_id,
        estado: "ACTIVO",
      },
      transaction: t,
    });

    const totalFinal = evidenciasActuales + archivos.length;

    if (totalFinal > 5) {
      const error = new Error(
        `Máximo 5 archivos permitidos. Actualmente existen ${evidenciasActuales} evidencias activas.`
      );
      error.statusCode = 400;
      throw error;
    }

    const uploadPromises = archivos.map((file) =>
      uploadFileToS3({
        file,
        categoria: "incidencias",
        entidadId: incidencia.id,
        serenoId: usuario_id,
      })
    );

    const resultados = await Promise.all(uploadPromises);

    const archivosData = resultados.map((result, index) => {
      const file = archivos[index];

      return {
        incidencia_id: incidencia.id,
        url_archivo: result.url,
        key_s3: result.key,
        tipo_archivo: getTipoArchivo(file.mimetype),
        mime_type: file.mimetype,
        peso: file.size,
        sereno_id: usuario_id,
      };
    });

    await IncidenciaArchivo.bulkCreate(archivosData, {
      transaction: t,
    });

    await incidencia.update(
      {
        total_evidencias: totalFinal,
      },
      {
        transaction: t,
      }
    );

    await t.commit();

    return {
      incidencia_id: Number(incidencia_id),
      total_evidencias: totalFinal,
      archivos: archivosData,
    };
  } catch (error) {
    await t.rollback();
    throw error;
  }
};

module.exports = addArchivosIncidenciaService;