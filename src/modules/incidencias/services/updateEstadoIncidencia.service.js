const db = require("../../../database/models");

// Modelos
const {
  sequelize,
  Incidencia,
  IncidenciaArchivo,
  Usuario,
} = db;

const estadosPermitidos = [
  "REPORTADO",
  "EN_PROCESO",
  "ATENDIDO",
  "CERRADO",
];

/*
|--------------------------------------------------------------------------
| Actualizar Estado de Incidencia
|--------------------------------------------------------------------------
*/
const updateEstadoIncidenciaService = async ({ id, estado }) => {
  const t = await sequelize.transaction();

  try {
    if (!id || isNaN(id)) {
      const error = new Error("ID inválido");
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

    const incidencia = await Incidencia.findByPk(id, {
      transaction: t,
    });

    if (!incidencia) {
      const error = new Error("Incidencia no encontrada");
      error.statusCode = 404;
      throw error;
    }

    if (incidencia.estado === estado) {
      const error = new Error(
        `La incidencia ya se encuentra en estado ${estado}`
      );
      error.statusCode = 400;
      throw error;
    }

    await incidencia.update(
      { estado },
      { transaction: t }
    );

    await t.commit();

    const incidenciaActualizada = await Incidencia.findByPk(id, {
      include: [
        {
          model: Usuario,
          as: "usuario",
          attributes: ["id", "nombre", "apellidos"],
        },
        {
          model: IncidenciaArchivo,
          as: "archivos",
          where: {
            estado: "ACTIVO",
          },
          required: false,
        },
      ],
    });

    return incidenciaActualizada;
  } catch (error) {
    await t.rollback();
    throw error;
  }
};

module.exports = updateEstadoIncidenciaService;