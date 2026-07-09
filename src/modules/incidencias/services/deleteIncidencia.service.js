const db = require("../../../database/models");

// Modelos
const {
  sequelize,
  Incidencia,
  IncidenciaArchivo
} = db;

/*
|--------------------------------------------------------------------------
| Eliminar Incidencia
|--------------------------------------------------------------------------
*/
const deleteIncidenciaService = async ({ id }) => {
  const t = await sequelize.transaction();

  try {
    if (!id || isNaN(id)) {
      const error = new Error("ID inválido");
      error.statusCode = 400;
      throw error;
    }

    const incidencia = await Incidencia.findByPk(id, {
      transaction: t,
    });

    if (!incidencia) {
      const error = new Error("Incidencia no encontrada");
      error.statusCode = 404;
      throw error;
    }

    if (incidencia.estado === "ELIMINADO") {
      const error = new Error("La incidencia ya fue eliminada");
      error.statusCode = 400;
      throw error;
    }

    await IncidenciaArchivo.update(
      {
        estado: "ELIMINADO",
      },
      {
        where: {
          incidencia_id: id,
        },
        transaction: t,
      }
    );

    await incidencia.update(
      {
        estado: "ELIMINADO",
      },
      {
        transaction: t,
      }
    );

    await t.commit();

    return {
      id: Number(id),
      estado: "ELIMINADO",
    };
  } catch (error) {
    await t.rollback();
    throw error;
  }
};

module.exports = deleteIncidenciaService;