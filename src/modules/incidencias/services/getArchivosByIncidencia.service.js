const db = require("../../../database/models");

// Modelos
const { Incidencia, IncidenciaArchivo } = db;

/*
|--------------------------------------------------------------------------
| Obtener Archivos de una Incidencia
|--------------------------------------------------------------------------
*/
const getArchivosByIncidenciaService = async ({
  incidencia_id,
  query = {},
}) => {
  const { estado = "ACTIVO" } = query;

  if (!incidencia_id || isNaN(incidencia_id)) {
    const error = new Error("ID de incidencia inválido");
    error.statusCode = 400;
    throw error;
  }

  const incidencia = await Incidencia.findByPk(incidencia_id, {
    attributes: ["id", "estado", "total_evidencias"],
  });

  if (!incidencia) {
    const error = new Error("Incidencia no encontrada");
    error.statusCode = 404;
    throw error;
  }

  if (incidencia.estado === "ELIMINADO") {
    const error = new Error("La incidencia se encuentra eliminada");
    error.statusCode = 400;
    throw error;
  }

  const where = {
    incidencia_id,
  };

  if (estado) {
    where.estado = estado;
  }

  const archivos = await IncidenciaArchivo.findAll({
    where,
    attributes: [
      "id",
      "incidencia_id",
      "url_archivo",
      "tipo_archivo",
      "mime_type",
      "peso",
      "sereno_id",
      "estado",
      "createdAt",
      "updatedAt",
    ],
    order: [["createdAt", "DESC"]],
  });

  return {
    incidencia_id: Number(incidencia_id),
    total: archivos.length,
    total_evidencias: incidencia.total_evidencias,
    data: archivos,
  };
};

module.exports = getArchivosByIncidenciaService;