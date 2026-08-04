const db = require("../../../database/models");

// Modelos
const {
  Incidencia,
  IncidenciaArchivo,
  PatrullajeProgramado,
  Usuario,
  Persona,
  Zonas,
} = db;

/*
|--------------------------------------------------------------------------
| Obtener incidencia por ID
|--------------------------------------------------------------------------
*/
const getIncidenciaByIdService = async ({ id, mode = "app" }) => {
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
  | 2. Validar modo de respuesta
  |--------------------------------------------------------------------------
  */
  const responseMode = mode === "web" ? "web" : "app";

  /*
  |--------------------------------------------------------------------------
  | 3. Consultar incidencia
  |--------------------------------------------------------------------------
  */
  const incidencia = await Incidencia.findByPk(incidenciaId, {
    include: [
      /*
      |--------------------------------------------------------------------------
      | Usuario que registró la incidencia
      |--------------------------------------------------------------------------
      */
      {
        model: Usuario,
        as: "usuario",
        required: false,
        attributes:
          responseMode === "web"
            ? ["id", "username", "correo", "estado"]
            : ["id", "username"],
        include: [
          {
            model: Persona,
            as: "persona",
            required: false,
            attributes:
              responseMode === "web"
                ? [
                  "id",
                  "nombres",
                  "apellidos",
                  "telefono",
                  "foto_perfil",
                ]
                : ["id", "nombres", "apellidos"],
          },
        ],
      },

      /*
      |--------------------------------------------------------------------------
      | Zona de la incidencia
      |--------------------------------------------------------------------------
      */
      {
        model: Zonas,
        as: "zona",
        required: false,
        attributes: ["id", "nombre"],
      },

      /*
      |--------------------------------------------------------------------------
      | Patrullaje relacionado
      |--------------------------------------------------------------------------
      */
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

      /*
      |--------------------------------------------------------------------------
      | Archivos de la incidencia
      |--------------------------------------------------------------------------
      | Se incluyen tanto para la aplicación móvil como para la web.
      |--------------------------------------------------------------------------
      */
      {
        model: IncidenciaArchivo,
        as: "archivos",
        required: false,
        where: {
          estado: "ACTIVO",
        },
        attributes:
          responseMode === "web"
            ? [
              "id",
              "incidencia_id",
              "url_archivo",
              "tipo_archivo",
              "mime_type",
              "peso",
              "estado",
              "createdAt",
              "updatedAt",
            ]
            : [
              "id",
              "url_archivo",
              "tipo_archivo",
              "mime_type",
              "peso",
            ],
      },
    ],

    /*
    |--------------------------------------------------------------------------
    | Ordenar los archivos del más reciente al más antiguo
    |--------------------------------------------------------------------------
    */
    order: [
      [
        { model: IncidenciaArchivo, as: "archivos" },
        "createdAt",
        "DESC",
      ],
    ],
  });

  /*
  |--------------------------------------------------------------------------
  | 4. Validar existencia
  |--------------------------------------------------------------------------
  */
  if (!incidencia) {
    const error = new Error("Incidencia no encontrada");
    error.statusCode = 404;
    throw error;
  }

  return incidencia;
};

module.exports = getIncidenciaByIdService;