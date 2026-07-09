const db = require("../../../database/models");

// Modulos
const {
    Incidencia,
    IncidenciaArchivo,
    Usuario,
    Zonas
} = db;
/*
|--------------------------------------------------------------------------
| Obtener Incidencias por Zona
|--------------------------------------------------------------------------
*/
const getIncidenciasByZonaService = async ({
    zona_id,
    query = {},
}) => {
    let {
        page = 1,
        limit = 10,
        mode = "app",
        estado,
        tipo,
        origen,
        incluir_archivos = "false",
    } = query;

    if (!zona_id || isNaN(zona_id)) {
        const error = new Error("ID de zona inválido");
        error.statusCode = 400;
        throw error;
    }

    page = Math.max(parseInt(page), 1);
    limit = Math.min(Math.max(parseInt(limit), 1), 50);

    const offset = (page - 1) * limit;

    const where = {
        zona_id,
    };

    if (estado) where.estado = estado;
    if (tipo) where.tipo = tipo;
    if (origen) where.origen = origen;

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

    const { count, rows } = await Incidencia.findAndCountAll({
        where,
        include,
        limit,
        offset,
        order: [["fecha_hora", "DESC"]],
        distinct: true,
    });

    return {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
        data: rows,
    };
};

module.exports = getIncidenciasByZonaService;