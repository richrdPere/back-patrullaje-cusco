const { Op } = require("sequelize");

const db = require("../../../database/models");

// Modelos
const {
    Incidencia,
    IncidenciaArchivo,
    Usuario,
    Persona,
    Zonas,
} = db;

/*
|--------------------------------------------------------------------------
| Obtener Incidencias por Usuario
|--------------------------------------------------------------------------
*/
const getIncidenciasByUsuarioService = async ({
    usuario_id,
    query = {},
}) => {
    let {
        page = 1,
        limit = 10,
        mode = "app", // app | web
        estado,
        tipo,
        origen,
        incluir_archivos = "false",
    } = query;

    /*
    |--------------------------------------------------------------------------
    | 1. Validar usuario
    |--------------------------------------------------------------------------
    */
    const usuarioId = Number(usuario_id);

    if (!Number.isInteger(usuarioId) || usuarioId <= 0) {
        const error = new Error("ID de usuario inválido");
        error.statusCode = 400;
        throw error;
    }

    /*
    |--------------------------------------------------------------------------
    | 2. Validar paginación
    |--------------------------------------------------------------------------
    */
    page = Number.parseInt(page, 10);
    limit = Number.parseInt(limit, 10);

    page = Number.isInteger(page) && page > 0
        ? page
        : 1;

    limit = Number.isInteger(limit) && limit > 0
        ? Math.min(limit, 50)
        : 10;

    const offset = (page - 1) * limit;

    /*
    |--------------------------------------------------------------------------
    | 3. Construir filtros
    |--------------------------------------------------------------------------
    */
    const where = {
        usuario_id: usuarioId,
        estado: {
            [Op.ne]: "ELIMINADO",
        },
    };

    if (estado) {
        where.estado = String(estado).trim().toUpperCase();
    }

    if (tipo) {
        where.tipo = String(tipo).trim().toUpperCase();
    }

    if (origen) {
        where.origen = String(origen).trim().toUpperCase();
    }

    /*
    |--------------------------------------------------------------------------
    | 4. Relaciones
    |--------------------------------------------------------------------------
    */
    const include = [
        {
            model: Usuario,
            as: "usuario",
            required: false,
            attributes:
                mode === "web"
                    ? ["id", "username", "correo", "estado"]
                    : ["id", "username"],
            include: [
                {
                    model: Persona,
                    as: "persona",
                    required: false,
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
            required: false,
            attributes: [
                "id",
                "nombre",
            ],
        },
    ];

    /*
    |--------------------------------------------------------------------------
    | 5. Archivos
    |--------------------------------------------------------------------------
    */
    const incluirArchivos =
        mode === "web" ||
        String(incluir_archivos).toLowerCase() === "true";

    if (incluirArchivos) {
        include.push({
            model: IncidenciaArchivo,
            as: "archivos",
            required: false,
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
        });
    }

    /*
    |--------------------------------------------------------------------------
    | 6. Consulta
    |--------------------------------------------------------------------------
    */
    const { count, rows } = await Incidencia.findAndCountAll({
        where,
        include,
        limit,
        offset,
        order: [
            ["fecha_hora", "DESC"],
        ],
        distinct: true,
    });

    return {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
        usuario_id: usuarioId,
        data: rows,
    };
};

module.exports = getIncidenciasByUsuarioService;