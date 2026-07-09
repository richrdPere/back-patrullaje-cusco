const { Op } = require("sequelize");

const db = require("../../../database/models");

// Modelos
const { Incidencia } = db;

const estadosPermitidos = [
  "REPORTADO",
  "EN_PROCESO",
  "ATENDIDO",
  "CERRADO",
];

/*
|--------------------------------------------------------------------------
| Cambiar Estado Masivo de Incidencias
|--------------------------------------------------------------------------
*/
const updateEstadoMasivoIncidenciasService = async ({
  ids,
  estado,
}) => {
  const t = await db.sequelize.transaction();

  try {
    if (!Array.isArray(ids) || ids.length === 0) {
      const error = new Error("Debe enviar un arreglo de IDs de incidencias");
      error.statusCode = 400;
      throw error;
    }

    const idsValidos = ids
      .map((id) => Number(id))
      .filter((id) => !isNaN(id) && id > 0);

    if (idsValidos.length === 0) {
      const error = new Error("No se enviaron IDs válidos");
      error.statusCode = 400;
      throw error;
    }

    if (!estado) {
      const error = new Error("El estado es obligatorio");
      error.statusCode = 400;
      throw error;
    }

    if (!estadosPermitidos.includes(estado)) {
      const error = new Error("Estado no válido");
      error.statusCode = 400;
      error.estadosPermitidos = estadosPermitidos;
      throw error;
    }

    const incidencias = await Incidencia.findAll({
      where: {
        id: {
          [Op.in]: idsValidos,
        },
        estado: {
          [Op.ne]: "ELIMINADO",
        },
      },
      transaction: t,
    });

    if (incidencias.length === 0) {
      const error = new Error("No se encontraron incidencias válidas para actualizar");
      error.statusCode = 404;
      throw error;
    }

    const idsEncontrados = incidencias.map((incidencia) => incidencia.id);

    const [totalActualizadas] = await Incidencia.update(
      {
        estado,
      },
      {
        where: {
          id: {
            [Op.in]: idsEncontrados,
          },
          estado: {
            [Op.ne]: estado,
          },
        },
        transaction: t,
      }
    );

    await t.commit();

    return {
      estado,
      solicitadas: idsValidos.length,
      encontradas: incidencias.length,
      actualizadas: totalActualizadas,
      no_encontradas: idsValidos.filter(
        (id) => !idsEncontrados.includes(id)
      ),
    };
  } catch (error) {
    await t.rollback();
    throw error;
  }
};

module.exports = updateEstadoMasivoIncidenciasService;