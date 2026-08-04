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
| Obtener incidencias por rango de fechas
|--------------------------------------------------------------------------
*/
const getIncidenciasByFechaService = async ({ query = {} }) => {
    let {
        fecha_inicio,
        fecha_fin,
        page = 1,
        limit = 10,
        mode = "web",
        estado,
        tipo,
        zona_id,
        usuario_id,
        origen,
        incluir_archivos = "false",
    } = query;

    /*
    |--------------------------------------------------------------------------
    | 1. Validar fecha inicial
    |--------------------------------------------------------------------------
    */
    if (!fecha_inicio) {
        const error = new Error("La fecha de inicio es obligatoria");
        error.statusCode = 400;
        throw error;
    }

    /*
    |--------------------------------------------------------------------------
    | 2. Convertir fechas
    |--------------------------------------------------------------------------
    */
    let fechaInicio;
    let fechaFin;

    if (esSoloFecha(fecha_inicio)) {
        fechaInicio = crearInicioDelDia(fecha_inicio);
    } else {
        fechaInicio = new Date(fecha_inicio);
    }

    if (fecha_fin) {
        if (esSoloFecha(fecha_fin)) {
            fechaFin = crearFinDelDia(fecha_fin);
        } else {
            fechaFin = new Date(fecha_fin);
        }
    } else {
        /*
        |--------------------------------------------------------------------------
        | Si no se envía fecha_fin, buscar todo el día de fecha_inicio
        |--------------------------------------------------------------------------
        */
        fechaFin = esSoloFecha(fecha_inicio)
            ? crearFinDelDia(fecha_inicio)
            : new Date(fechaInicio);
    }

    if (
        Number.isNaN(fechaInicio.getTime()) ||
        Number.isNaN(fechaFin.getTime())
    ) {
        const error = new Error("Formato de fechas inválido");
        error.statusCode = 400;
        throw error;
    }

    if (fechaInicio > fechaFin) {
        const error = new Error(
            "La fecha de inicio no puede ser mayor a la fecha fin"
        );
        error.statusCode = 400;
        throw error;
    }

    /*
    |--------------------------------------------------------------------------
    | 3. Paginación
    |--------------------------------------------------------------------------
    */
    page = Number.parseInt(page, 10);
    limit = Number.parseInt(limit, 10);

    page = Number.isInteger(page) && page > 0 ? page : 1;
    limit =
        Number.isInteger(limit) && limit > 0
            ? Math.min(limit, 100)
            : 10;

    const offset = (page - 1) * limit;

    /*
    |--------------------------------------------------------------------------
    | 4. Filtros
    |--------------------------------------------------------------------------
    */
    const where = {
        fecha_hora: {
            [Op.between]: [fechaInicio, fechaFin],
        },
        estado: {
            [Op.ne]: "ELIMINADO",
        },
    };

    if (estado) {
        where.estado = estado.trim().toUpperCase();
    }

    if (tipo) {
        where.tipo = tipo.trim().toUpperCase();
    }

    if (zona_id) {
        const zonaId = Number(zona_id);

        if (Number.isInteger(zonaId) && zonaId > 0) {
            where.zona_id = zonaId;
        }
    }

    if (usuario_id) {
        const usuarioId = Number(usuario_id);

        if (Number.isInteger(usuarioId) && usuarioId > 0) {
            where.usuario_id = usuarioId;
        }
    }

    if (origen) {
        where.origen = origen.trim().toUpperCase();
    }

    /*
    |--------------------------------------------------------------------------
    | 5. Relaciones
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
            attributes: ["id", "nombre"],
        },
    ];

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
        order: [["fecha_hora", "DESC"]],
        distinct: true,
    });

    return {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
        fecha_inicio: fechaInicio,
        fecha_fin: fechaFin,
        data: rows,
    };
};

/*
|--------------------------------------------------------------------------
| Verificar si el valor tiene formato YYYY-MM-DD
|--------------------------------------------------------------------------
*/
const esSoloFecha = (valor) => {
    return /^\d{4}-\d{2}-\d{2}$/.test(String(valor));
};

/*
|--------------------------------------------------------------------------
| Crear inicio del día en hora local
|--------------------------------------------------------------------------
*/
const crearInicioDelDia = (fecha) => {
    const [anio, mes, dia] = fecha.split("-").map(Number);

    return new Date(
        anio,
        mes - 1,
        dia,
        0,
        0,
        0,
        0
    );
};

/*
|--------------------------------------------------------------------------
| Crear final del día en hora local
|--------------------------------------------------------------------------
*/
const crearFinDelDia = (fecha) => {
    const [anio, mes, dia] = fecha.split("-").map(Number);

    return new Date(
        anio,
        mes - 1,
        dia,
        23,
        59,
        59,
        999
    );
};

module.exports = getIncidenciasByFechaService;