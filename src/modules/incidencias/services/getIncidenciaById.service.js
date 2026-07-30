const db = require("../../../database/models");

// Modelos
const {
  sequelize,
  Incidencia,
  IncidenciaArchivo,
  PatrullajeProgramado,
  Usuario,
  Persona,
  Zonas
} = db;
/*
|--------------------------------------------------------------------------
| Obtener Incidencia por ID
|--------------------------------------------------------------------------
*/
const getIncidenciaByIdService = async ({ id, mode = "app" }) => {
  if (!id || isNaN(id)) {
    const error = new Error("ID inválido");
    error.statusCode = 400;
    throw error;
  }

  const include = [
    {
      model: Usuario,
      as: "usuario",
      attributes:
        mode === "web"
          ? ["id", "username", "correo", "estado"]
          : ["id", "username"],
      include: [
        {
          model: Persona,
          as: "persona",
          attributes:
            mode === "web"
              ? [
                "id",
                "nombres",
                "apellidos",
                "telefono",
              ]
              : [
                "id",
                "nombres",
                "apellidos",
              ],
        },
      ],
    },
    {
      model: Zonas,
      as: "zona",
      attributes: ["id", "nombre"],
    },
    {
      model: PatrullajeProgramado,
      as: "patrullaje",
      attributes: ["id", "fecha", "hora_inicio", "hora_fin", "estado"],
      required: false,
    },
  ];

  if (mode === "web") {
    include.push({
      model: IncidenciaArchivo,
      as: "archivos",
      attributes: [
        "id",
        "url_archivo",
        "tipo_archivo",
        "mime_type",
        "peso",
        "createdAt",
      ],
      where: {
        estado: "ACTIVO",
      },
      required: false,
    });
  }

  const incidencia = await Incidencia.findByPk(id, {
    include,
  });

  if (!incidencia) {
    const error = new Error("Incidencia no encontrada");
    error.statusCode = 404;
    throw error;
  }

  return incidencia;
};

module.exports = getIncidenciaByIdService;