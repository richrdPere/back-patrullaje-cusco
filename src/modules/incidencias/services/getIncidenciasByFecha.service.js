const { Op } = require("sequelize");

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
| Obtener Incidencias por Rango de Fechas
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

    if (!fecha_inicio || !fecha_fin) {
        const error = new Error("Las fechas de inicio y fin son obligatorias");
        error.statusCode = 400;
        throw error;
    }

    const fechaInicio = new Date(fecha_inicio);
    const fechaFin = new Date(fecha_fin);

    if (isNaN(fechaInicio.getTime()) || isNaN(fechaFin.getTime())) {
        const error = new Error("Formato de fechas inválido");
        error.statusCode = 400;
        throw error;
    }

    if (fechaInicio > fechaFin) {
        const error = new Error("La fecha de inicio no puede ser mayor a la fecha fin");
        error.statusCode = 400;
        throw error;
    }

    page = Math.max(parseInt(page), 1);
    limit = Math.min(Math.max(parseInt(limit), 1), 100);

    const offset = (page - 1) * limit;

    const where = {
        fecha_hora: {
            [Op.between]: [fechaInicio, fechaFin],
        },
        estado: {
            [Op.ne]: "ELIMINADO",
        },
    };

    if (estado) where.estado = estado;
    if (tipo) where.tipo = tipo;
    if (zona_id) where.zona_id = zona_id;
    if (usuario_id) where.usuario_id = usuario_id;
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
        fecha_inicio: fechaInicio,
        fecha_fin: fechaFin,
        data: rows,
    };
};

module.exports = getIncidenciasByFechaService;