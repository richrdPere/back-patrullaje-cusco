const { Op } = require("sequelize");
const db = require("../../../database/models");

// Models
const {
  HistorialPatrullaje,
  Incidencia,
  PatrullajeProgramado,
  Persona,
  UnidadPatrullaje,
  Usuario,
  Zonas,
} = db;

/**
 * Obtiene el historial operativo de patrullajes de forma paginada.
 *
 * Filtros soportados:
 * - fecha_inicio
 * - fecha_fin
 * - unidad_id
 * - zona_id
 * - usuario_id
 * - patrullaje_id
 * - incidencia_id
 * - tipo
 * - prioridad
 * - estado
 * - visible_para_siguiente_turno
 * - search
 * - page
 * - limit
 */

// Service
const getHistorialPaginadoService = async ({
  page = 1,
  limit = 10,

  fecha_inicio,
  fecha_fin,

  unidad_id,
  zona_id,
  usuario_id,
  patrullaje_id,
  incidencia_id,

  tipo,
  prioridad,
  estado,

  visible_para_siguiente_turno,
  search,
} = {}) => {
  try {
    // =========================================================
    // 1. NORMALIZAR PAGINACIÓN
    // =========================================================

    const pageNumber = Math.max(
      Number.parseInt(page, 10) || 1,
      1
    );

    const limitNumber = Math.min(
      Math.max(Number.parseInt(limit, 10) || 10, 1),
      100
    );

    const offset = (pageNumber - 1) * limitNumber;

    // =========================================================
    // 2. WHERE PRINCIPAL
    // =========================================================

    const where = {};

    if (zona_id) {
      where.zona_id = Number(zona_id);
    }

    if (usuario_id) {
      where.usuario_id = Number(usuario_id);
    }

    if (patrullaje_id) {
      where.patrullaje_id = Number(patrullaje_id);
    }

    if (incidencia_id) {
      where.incidencia_id = Number(incidencia_id);
    }

    if (tipo) {
      where.tipo = String(tipo).toUpperCase();
    }

    if (prioridad) {
      where.prioridad = String(prioridad).toUpperCase();
    }

    if (estado) {
      where.estado = String(estado).toUpperCase();
    }

    if (
      visible_para_siguiente_turno !== undefined &&
      visible_para_siguiente_turno !== null &&
      visible_para_siguiente_turno !== ""
    ) {
      where.visible_para_siguiente_turno =
        parseBoolean(visible_para_siguiente_turno);
    }

    // =========================================================
    // 3. FILTRO POR FECHA
    // =========================================================

    const fechaInicioNormalizada = normalizeStartDate(fecha_inicio);
    const fechaFinNormalizada = normalizeEndDate(fecha_fin);

    if (fechaInicioNormalizada && fechaFinNormalizada) {
      where.fecha_hora = {
        [Op.between]: [
          fechaInicioNormalizada,
          fechaFinNormalizada,
        ],
      };
    } else if (fechaInicioNormalizada) {
      where.fecha_hora = {
        [Op.gte]: fechaInicioNormalizada,
      };
    } else if (fechaFinNormalizada) {
      where.fecha_hora = {
        [Op.lte]: fechaFinNormalizada,
      };
    }

    // =========================================================
    // 4. BÚSQUEDA POR TEXTO
    // =========================================================

    if (search && String(search).trim()) {
      const searchValue = String(search).trim();

      where[Op.or] = [
        {
          titulo: {
            [Op.like]: `%${searchValue}%`,
          },
        },
        {
          descripcion: {
            [Op.like]: `%${searchValue}%`,
          },
        },
      ];
    }

    // =========================================================
    // 5. FILTRO POR UNIDAD
    // =========================================================

    const unidadWhere = {};

    if (unidad_id) {
      unidadWhere.id = Number(unidad_id);
    }

    // =========================================================
    // 6. INCLUDES
    // =========================================================
    const include = [
      {
        model: Usuario,
        as: "usuario",
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
            attributes: [
              "id",
              "nombres",
              "apellidos",
              "documento_identidad",
              "telefono",
              "foto_perfil",
            ],
          },
        ],
      },
      {
        model: Zonas,
        as: "zona",
        attributes: [
          "id",
          "nombre",
          "descripcion",
          "estado",
        ],
      },
      {
        model: PatrullajeProgramado,
        as: "patrullaje_programado",
        attributes: [
          "id",
          "zona_id",
          "unidad_id",
          "fecha",
          "hora_inicio",
          "hora_fin",
          "estado",
        ],
        required: Boolean(unidad_id),
        include: [
          {
            model: UnidadPatrullaje,
            as: "unidad",
            attributes: [
              "id",
              "codigo",
              "placa",
              "tipo",
              "estado",
            ],
            where:
              Object.keys(unidadWhere).length > 0
                ? unidadWhere
                : undefined,
            required: Boolean(unidad_id),
          },
        ],
      },
      {
        model: Incidencia,
        as: "incidencia",
        required: false,
        attributes: [
          "id",
          "tipo",
          "descripcion",
          "estado",
          "latitud",
          "longitud",
          "fecha_hora",
        ],
      },
    ];

    // =========================================================
    // 7. CONSULTA PAGINADA
    // =========================================================

    const { count, rows } =
      await HistorialPatrullaje.findAndCountAll({
        where,
        include,

        limit: limitNumber,
        offset,

        order: [
          ["fecha_hora", "DESC"],
          ["id", "DESC"],
        ],

        distinct: true,
      });

    const totalItems = Number(count);
    const totalPages = Math.ceil(
      totalItems / limitNumber
    );

    // =========================================================
    // 8. RESPUESTA
    // =========================================================

    return {
      data: rows,
      pagination: {
        page: pageNumber,
        limit: limitNumber,
        totalItems,
        totalPages,
        hasNextPage: pageNumber < totalPages,
        hasPreviousPage: pageNumber > 1,
      },

      filters: {
        fecha_inicio: fecha_inicio || null,
        fecha_fin: fecha_fin || null,

        unidad_id: unidad_id
          ? Number(unidad_id)
          : null,

        zona_id: zona_id
          ? Number(zona_id)
          : null,

        usuario_id: usuario_id
          ? Number(usuario_id)
          : null,

        patrullaje_id: patrullaje_id
          ? Number(patrullaje_id)
          : null,

        incidencia_id: incidencia_id
          ? Number(incidencia_id)
          : null,

        tipo: tipo || null,
        prioridad: prioridad || null,
        estado: estado || null,

        visible_para_siguiente_turno:
          visible_para_siguiente_turno ?? null,

        search: search || null,
      },
    };
  } catch (error) {
    console.error("Error en getHistorialPaginadoService:", error);

    throw new Error(error.message || "No se pudo obtener el historial de patrullajes.");
  }
};

// =========================================================
// UTILIDADES
// =========================================================

const parseBoolean = (value) => {
  if (typeof value === "boolean") {
    return value;
  }

  const normalized = String(value)
    .trim()
    .toLowerCase();

  if (
    normalized === "true" ||
    normalized === "1"
  ) {
    return true;
  }

  if (
    normalized === "false" ||
    normalized === "0"
  ) {
    return false;
  }

  throw new Error(
    "visible_para_siguiente_turno debe ser true o false."
  );
};

/**
 * Convierte una fecha YYYY-MM-DD al inicio del día.
 */
const normalizeStartDate = (value) => {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new Error(
      "La fecha de inicio no es válida."
    );
  }

  /*
   * Si solo se recibe YYYY-MM-DD, se considera el inicio
   * del día.
   */
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    date.setHours(0, 0, 0, 0);
  }

  return date;
};

/**
 * Convierte una fecha YYYY-MM-DD al final del día.
 */
const normalizeEndDate = (value) => {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new Error(
      "La fecha final no es válida."
    );
  }

  /*
   * Si solo se recibe YYYY-MM-DD, se considera el final
   * del día.
   */
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    date.setHours(23, 59, 59, 999);
  }

  return date;
};

module.exports = getHistorialPaginadoService;