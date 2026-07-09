const { Op, fn, col, literal } = require("sequelize");

const db = require("../../../database/models");

// Modelos
const { Incidencia, Zonas } = db;

/*
|--------------------------------------------------------------------------
| Resumen Estadístico de Incidencias
|--------------------------------------------------------------------------
*/
const getResumenIncidenciasService = async ({ query = {} }) => {
    const {
        fecha_inicio,
        fecha_fin,
        zona_id,
        usuario_id,
        origen,
    } = query;

    const where = {
        estado: {
            [Op.ne]: "ELIMINADO",
        },
    };

    if (zona_id) where.zona_id = zona_id;
    if (usuario_id) where.usuario_id = usuario_id;
    if (origen) where.origen = origen;

    if (fecha_inicio && fecha_fin) {
        where.fecha_hora = {
            [Op.between]: [
                new Date(fecha_inicio),
                new Date(fecha_fin),
            ],
        };
    }

    const total = await Incidencia.count({ where });

    const porEstado = await Incidencia.findAll({
        where,
        attributes: [
            "estado",
            [fn("COUNT", col("id")), "total"],
        ],
        group: ["estado"],
        raw: true,
    });

    const porTipo = await Incidencia.findAll({
        where,
        attributes: [
            "tipo",
            [fn("COUNT", col("id")), "total"],
        ],
        group: ["tipo"],
        raw: true,
    });

    const porZona = await Incidencia.findAll({
        where,
        attributes: [
            "zona_id",
            [fn("COUNT", col("Incidencia.id")), "total"],
        ],
        include: [
            {
                model: Zonas,
                as: "zona",
                attributes: ["id", "nombre"],
            },
        ],
        group: ["zona_id", "zona.id", "zona.nombre"],
        order: [[literal("total"), "DESC"]],
    });

    const ultimasIncidencias = await Incidencia.findAll({
        where,
        attributes: [
            "id",
            "tipo",
            "estado",
            "descripcion",
            "latitud",
            "longitud",
            "fecha_hora",
            "origen",
        ],
        include: [
            {
                model: Zonas,
                as: "zona",
                attributes: ["id", "nombre"],
            },
        ],
        order: [["fecha_hora", "DESC"]],
        limit: 5,
    });

    return {
        total,
        porEstado,
        porTipo,
        porZona,
        ultimasIncidencias,
    };
};

module.exports = getResumenIncidenciasService;