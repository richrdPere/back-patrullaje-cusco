const { Op } = require("sequelize");

const db = require("../../../database/models");

// Modelos
const {
  sequelize,
  Incidencia,
} = db;

const estadosPermitidos = [
  "REPORTADO",
  "EN_PROCESO",
  "ATENDIDO",
  "CERRADO",
];

/*
|--------------------------------------------------------------------------
| Cambiar estado masivo de incidencias
|--------------------------------------------------------------------------
*/
const updateEstadoMasivoIncidenciasService = async ({
  ids,
  estado,
}) => {
  /*
  |--------------------------------------------------------------------------
  | 1. Validar IDs
  |--------------------------------------------------------------------------
  */
  if (!Array.isArray(ids) || ids.length === 0) {
    const error = new Error(
      "Debe enviar un arreglo de IDs de incidencias"
    );
    error.statusCode = 400;
    throw error;
  }

  /*
  |--------------------------------------------------------------------------
  | Convertir, validar y eliminar duplicados
  |--------------------------------------------------------------------------
  */
  const idsValidos = [
    ...new Set(
      ids
        .map((id) => Number(id))
        .filter(
          (id) =>
            Number.isInteger(id) &&
            id > 0
        )
    ),
  ];

  if (idsValidos.length === 0) {
    const error = new Error(
      "No se enviaron IDs de incidencias válidos"
    );
    error.statusCode = 400;
    throw error;
  }

  /*
  |--------------------------------------------------------------------------
  | 2. Validar estado
  |--------------------------------------------------------------------------
  */
  if (!estado || typeof estado !== "string") {
    const error = new Error("El estado es obligatorio");
    error.statusCode = 400;
    throw error;
  }

  const estadoNormalizado = estado.trim().toUpperCase();

  if (!estadosPermitidos.includes(estadoNormalizado)) {
    const error = new Error(
      `Estado no válido. Estados permitidos: ${estadosPermitidos.join(", ")}`
    );
    error.statusCode = 400;
    error.estadosPermitidos = estadosPermitidos;
    throw error;
  }

  /*
  |--------------------------------------------------------------------------
  | 3. Actualizar dentro de una transacción administrada
  |--------------------------------------------------------------------------
  */
  const resultado = await sequelize.transaction(
    async (transaction) => {
      /*
      |--------------------------------------------------------------------------
      | Buscar incidencias existentes y no eliminadas
      |--------------------------------------------------------------------------
      */
      const incidenciasEncontradas = await Incidencia.findAll({
        where: {
          id: {
            [Op.in]: idsValidos,
          },
          estado: {
            [Op.ne]: "ELIMINADO",
          },
        },
        attributes: [
          "id",
          "estado",
        ],
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      if (incidenciasEncontradas.length === 0) {
        const error = new Error(
          "No se encontraron incidencias válidas para actualizar"
        );
        error.statusCode = 404;
        throw error;
      }

      const idsEncontrados = incidenciasEncontradas.map(
        (incidencia) => incidencia.id
      );

      /*
      |--------------------------------------------------------------------------
      | Obtener las incidencias que realmente necesitan actualización
      |--------------------------------------------------------------------------
      */
      const idsPorActualizar = incidenciasEncontradas
        .filter(
          (incidencia) =>
            incidencia.estado !== estadoNormalizado
        )
        .map((incidencia) => incidencia.id);

      /*
      |--------------------------------------------------------------------------
      | Actualizar solo las que tienen un estado diferente
      |--------------------------------------------------------------------------
      */
      let totalActualizadas = 0;

      if (idsPorActualizar.length > 0) {
        const [cantidadActualizada] = await Incidencia.update(
          {
            estado: estadoNormalizado,
          },
          {
            where: {
              id: {
                [Op.in]: idsPorActualizar,
              },
            },
            transaction,
          }
        );

        totalActualizadas = cantidadActualizada;
      }

      /*
      |--------------------------------------------------------------------------
      | Recuperar el resultado final dentro de la misma transacción
      |--------------------------------------------------------------------------
      */
      const incidenciasActualizadas = await Incidencia.findAll({
        where: {
          id: {
            [Op.in]: idsEncontrados,
          },
        },
        attributes: [
          "id",
          "estado",
        ],
        order: [
          ["id", "ASC"],
        ],
        transaction,
      });

      return {
        estado: estadoNormalizado,
        total_solicitadas: idsValidos.length,
        total_encontradas: idsEncontrados.length,
        total_actualizadas: totalActualizadas,

        incidencias: incidenciasActualizadas.map(
          (incidencia) => ({
            id: incidencia.id,
            estado: incidencia.estado,
          })
        ),

        no_encontradas: idsValidos.filter(
          (id) => !idsEncontrados.includes(id)
        ),
      };
    }
  );

  return resultado;
};

module.exports = updateEstadoMasivoIncidenciasService;