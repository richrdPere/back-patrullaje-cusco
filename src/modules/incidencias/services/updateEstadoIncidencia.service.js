const db = require("../../../database/models");

// Modelos
const {
  sequelize,
  Incidencia,
  IncidenciaArchivo,
  Usuario,
  Persona,
  Zonas,
  PatrullajeProgramado,
} = db;

const estadosPermitidos = [
  "REPORTADO",
  "EN_PROCESO",
  "ATENDIDO",
  "CERRADO",
];

/*
|--------------------------------------------------------------------------
| Actualizar estado de incidencia
|--------------------------------------------------------------------------
*/
const updateEstadoIncidenciaService = async ({ id, estado }) => {
  /*
  |--------------------------------------------------------------------------
  | 1. Validar ID
  |--------------------------------------------------------------------------
  */
  const incidenciaId = Number(id);

  if (!Number.isInteger(incidenciaId) || incidenciaId <= 0) {
    const error = new Error("ID de incidencia inválido");
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
  await sequelize.transaction(async (transaction) => {
    const incidencia = await Incidencia.findByPk(incidenciaId, {
      transaction,

      // Bloqueo opcional para evitar actualizaciones concurrentes
      lock: transaction.LOCK.UPDATE,
    });

    if (!incidencia) {
      const error = new Error("Incidencia no encontrada");
      error.statusCode = 404;
      throw error;
    }

    if (incidencia.estado === estadoNormalizado) {
      const error = new Error(
        `La incidencia ya se encuentra en estado ${estadoNormalizado}`
      );
      error.statusCode = 400;
      throw error;
    }

    /*
    |--------------------------------------------------------------------------
    | Validar transiciones de estado
    |--------------------------------------------------------------------------
    */
    validarTransicionEstado(
      incidencia.estado,
      estadoNormalizado
    );

    await incidencia.update(
      {
        estado: estadoNormalizado,
      },
      {
        transaction,
      }
    );
  });

  /*
  |--------------------------------------------------------------------------
  | 4. Consultar la incidencia actualizada
  |--------------------------------------------------------------------------
  | Se ejecuta después del commit automático.
  |--------------------------------------------------------------------------
  */
  const incidenciaActualizada = await Incidencia.findByPk(incidenciaId, {
    include: [
      {
        model: Usuario,
        as: "usuario",
        required: false,
        attributes: [
          "id",
          "username",
          "correo",
          "estado",
        ],
        include: [
          {
            model: Persona,
            as: "persona",
            required: false,
            attributes: [
              "id",
              "nombres",
              "apellidos",
              "telefono",
            ],
          },
        ],
      },
      {
        model: Zonas,
        as: "zona",
        required: false,
        attributes: [
          "id",
          "nombre",
        ],
      },
      {
        model: PatrullajeProgramado,
        as: "patrullaje",
        required: false,
        attributes: [
          "id",
          "fecha",
          "hora_inicio",
          "hora_fin",
          "estado",
        ],
      },
      {
        model: IncidenciaArchivo,
        as: "archivos",
        required: false,
        where: {
          estado: "ACTIVO",
        },
        attributes: [
          "id",
          "url_archivo",
          "tipo_archivo",
          "mime_type",
          "peso",
        ],
      },
    ],
  });

  if (!incidenciaActualizada) {
    const error = new Error(
      "La incidencia fue actualizada, pero no pudo recuperarse"
    );
    error.statusCode = 500;
    throw error;
  }

  return incidenciaActualizada;
};

/*
|--------------------------------------------------------------------------
| Validar transición de estados
|--------------------------------------------------------------------------
*/
const validarTransicionEstado = (estadoActual, nuevoEstado) => {
  const transicionesPermitidas = {
    REPORTADO: ["EN_PROCESO"],
    EN_PROCESO: ["ATENDIDO"],
    ATENDIDO: ["CERRADO"],
    CERRADO: [],
  };

  const estadosSiguientes =
    transicionesPermitidas[estadoActual] ?? [];

  if (!estadosSiguientes.includes(nuevoEstado)) {
    const error = new Error(
      `No se puede cambiar la incidencia de ${estadoActual} a ${nuevoEstado}`
    );

    error.statusCode = 400;
    error.estadoActual = estadoActual;
    error.transicionesPermitidas = estadosSiguientes;

    throw error;
  }
};

module.exports = updateEstadoIncidenciaService;