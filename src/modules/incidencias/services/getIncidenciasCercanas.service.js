const { Op, literal } = require("sequelize");

const db = require("../../../database/models");

// Modelos
const {
    Incidencia,
    IncidenciaArchivo,
    Usuario,
    Zonas
} = db;
/*
|--------------------------------------------------------------------------
| Obtener Incidencias Cercanas
|--------------------------------------------------------------------------
*/
const getIncidenciasCercanasService = async ({ query = {} }) => {
    let {
        latitud,
        longitud,
        radio = 500, // metros
        limit = 20,
        mode = "app",
        tipo,
        estado,
        incluir_archivos = "false",
    } = query;

    if (!latitud || !longitud) {
        const error = new Error("Latitud y longitud son obligatorias");
        error.statusCode = 400;
        throw error;
    }

    const lat = parseFloat(latitud);
    const lng = parseFloat(longitud);
    const radioMetros = parseFloat(radio);

    if (isNaN(lat) || isNaN(lng)) {
        const error = new Error("Coordenadas inválidas");
        error.statusCode = 400;
        throw error;
    }

    if (isNaN(radioMetros) || radioMetros <= 0) {
        const error = new Error("Radio inválido");
        error.statusCode = 400;
        throw error;
    }

    limit = Math.min(Math.max(parseInt(limit), 1), 50);

    const where = {
        estado: {
            [Op.ne]: "ELIMINADO",
        },
    };

    if (tipo) where.tipo = tipo;
    if (estado) where.estado = estado;

    const distanciaLiteral = literal(`
    (
      6371000 * acos(
        cos(radians(${lat})) *
        cos(radians(latitud)) *
        cos(radians(longitud) - radians(${lng})) +
        sin(radians(${lat})) *
        sin(radians(latitud))
      )
    )
  `);

    const include = [
        {
            model: Usuario,
            as: "usuario",
            attributes:
                mode === "web"
                    ? ["id", "nombre", "apellidos", "email", "telefono"]
                    : ["id", "nombre", "apellidos"],
        },
        {
            model: Zonas,
            as: "zona",
            attributes: ["id", "nombre"],
        },
    ];

    if (mode === "web" || incluir_archivos === "true") {
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

    const incidencias = await Incidencia.findAll({
        where,
        include,
        attributes: {
            include: [[distanciaLiteral, "distancia_metros"]],
        },
        having: literal(`distancia_metros <= ${radioMetros}`),
        order: [[literal("distancia_metros"), "ASC"]],
        limit,
        subQuery: false,
    });

    return {
        latitud: lat,
        longitud: lng,
        radio_metros: radioMetros,
        total: incidencias.length,
        data: incidencias,
    };
};

module.exports = getIncidenciasCercanasService;