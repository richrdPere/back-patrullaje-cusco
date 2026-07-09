const db = require("../../../database/models");
const { deleteFileFromS3 } = require("../../../services/aws-s3.service");

// Modelos
const {
  sequelize,
  Incidencia,
  IncidenciaArchivo
} = db;
/*
|--------------------------------------------------------------------------
| Eliminar Archivo de Incidencia
|--------------------------------------------------------------------------
*/
const deleteArchivoIncidenciaService = async ({
  incidencia_id,
  archivo_id,
}) => {
  const t = await sequelize.transaction();

  try {
    if (!incidencia_id || isNaN(incidencia_id)) {
      const error = new Error("ID de incidencia inválido");
      error.statusCode = 400;
      throw error;
    }

    if (!archivo_id || isNaN(archivo_id)) {
      const error = new Error("ID de archivo inválido");
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
      const error = new Error(
        "No se puede eliminar archivos de una incidencia eliminada"
      );
      error.statusCode = 400;
      throw error;
    }

    const archivo = await IncidenciaArchivo.findOne({
      where: {
        id: archivo_id,
        incidencia_id,
      },
      transaction: t,
    });

    if (!archivo) {
      const error = new Error("Archivo de incidencia no encontrado");
      error.statusCode = 404;
      throw error;
    }

    if (archivo.estado === "ELIMINADO") {
      const error = new Error("El archivo ya fue eliminado");
      error.statusCode = 400;
      throw error;
    }

    if (archivo.key_s3) {
      await deleteFileFromS3(archivo.key_s3);
    }

    await archivo.update(
      {
        estado: "ELIMINADO",
      },
      {
        transaction: t,
      }
    );

    const totalEvidencias = await IncidenciaArchivo.count({
      where: {
        incidencia_id,
        estado: "ACTIVO",
      },
      transaction: t,
    });

    await incidencia.update(
      {
        total_evidencias: totalEvidencias,
      },
      {
        transaction: t,
      }
    );

    await t.commit();

    return {
      incidencia_id: Number(incidencia_id),
      archivo_id: Number(archivo_id),
      estado: "ELIMINADO",
      total_evidencias: totalEvidencias,
    };
  } catch (error) {
    await t.rollback();
    throw error;
  }
};

module.exports = deleteArchivoIncidenciaService;