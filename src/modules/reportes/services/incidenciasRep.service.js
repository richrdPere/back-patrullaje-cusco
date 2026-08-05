const { Op, fn, col, } = require("sequelize");
const db = require("../../../database/models");

// Utils
const {
  createServiceError,
  normalizeEndDate,
  normalizeStartDate,
  parseBoolean,
  parsePositiveInteger,
} = require("../utils/func_rep_incidencia.utils");

const TIPOS_INCIDENCIA = [
  "ROBO",
  "ACCIDENTE",
  "INCENDIO",
  "VIOLENCIA",
  "SOSPECHOSO",
  "OTRO",
];

const ESTADOS_INCIDENCIA = [
  "REPORTADO",
  "EN_PROCESO",
  "ATENDIDO",
  "CERRADO",
  "ELIMINADO",
];

const ORIGENES_INCIDENCIA = [
  "APP_MOVIL",
  "CENTRAL",
  "SISTEMA",
];

/**
 * Genera el reporte consolidado de incidencias.
 *
 * Filtros:
 * - page
 * - limit
 * - fecha_inicio
 * - fecha_fin
 * - usuario_id
 * - patrullaje_id
 * - zona_id
 * - unidad_id
 * - tipo
 * - estado
 * - origen
 * - con_evidencias
 * - search
 */
const reporteIncidenciasService = async ({
  page = 1,
  limit = 10,

  fecha_inicio,
  fecha_fin,

  usuario_id,
  patrullaje_id,
  zona_id,
  unidad_id,

  tipo,
  estado,
  origen,

  con_evidencias,
  search,
} = {}) => {

  // =========================================================
  // 1. VALIDAR Y NORMALIZAR PAGINACIÓN
  // =========================================================
  const pageNumber = Math.max(Number.parseInt(page, 10) || 1, 1,);

  const limitNumber = Math.min(
    Math.max(
      Number.parseInt(limit, 10) || 10,
      1,
    ),
    100,
  );

  const offset =
    (pageNumber - 1) * limitNumber;

  // =========================================================
  // 2. VALIDAR ENUMS
  // =========================================================
  const tipoNormalizado = tipo
    ? String(tipo).trim().toUpperCase()
    : null;

  const estadoNormalizado = estado
    ? String(estado).trim().toUpperCase()
    : null;

  const origenNormalizado = origen
    ? String(origen).trim().toUpperCase()
    : null;

  if (
    tipoNormalizado &&
    !TIPOS_INCIDENCIA.includes(tipoNormalizado)
  ) {
    throw createServiceError(
      `Tipo de incidencia no válido. Valores permitidos: ${TIPOS_INCIDENCIA.join(", ")}.`,
      400,
    );
  }

  if (
    estadoNormalizado &&
    !ESTADOS_INCIDENCIA.includes(
      estadoNormalizado,
    )
  ) {
    throw createServiceError(
      `Estado de incidencia no válido. Valores permitidos: ${ESTADOS_INCIDENCIA.join(", ")}.`,
      400,
    );
  }

  if (
    origenNormalizado &&
    !ORIGENES_INCIDENCIA.includes(
      origenNormalizado,
    )
  ) {
    throw createServiceError(
      `Origen de incidencia no válido. Valores permitidos: ${ORIGENES_INCIDENCIA.join(", ")}.`,
      400,
    );
  }

  // =========================================================
  // 3. WHERE PRINCIPAL
  // =========================================================
  const where = {};

  if (usuario_id) {
    where.usuario_id =
      parsePositiveInteger(
        usuario_id,
        "usuario_id",
      );
  }

  if (patrullaje_id) {
    where.patrullaje_id =
      parsePositiveInteger(
        patrullaje_id,
        "patrullaje_id",
      );
  }

  if (zona_id) {
    where.zona_id =
      parsePositiveInteger(
        zona_id,
        "zona_id",
      );
  }

  if (tipoNormalizado) {
    where.tipo = tipoNormalizado;
  }

  if (estadoNormalizado) {
    where.estado = estadoNormalizado;
  }

  if (origenNormalizado) {
    where.origen = origenNormalizado;
  }

  // =========================================================
  // 4. FILTRO POR FECHA
  // =========================================================

  const fechaInicio = normalizeStartDate(fecha_inicio);

  const fechaFin = normalizeEndDate(fecha_fin);

  if (
    fechaInicio &&
    fechaFin &&
    fechaInicio > fechaFin
  ) {
    throw createServiceError(
      "La fecha inicial no puede ser posterior a la fecha final.",
      400,
    );
  }

  if (fechaInicio && fechaFin) {
    where.fecha_hora = {
      [Op.between]: [
        fechaInicio,
        fechaFin,
      ],
    };
  } else if (fechaInicio) {
    where.fecha_hora = {
      [Op.gte]: fechaInicio,
    };
  } else if (fechaFin) {
    where.fecha_hora = {
      [Op.lte]: fechaFin,
    };
  }

  // =========================================================
  // 5. FILTRO POR EVIDENCIAS
  // =========================================================

  if (
    con_evidencias !== undefined &&
    con_evidencias !== null &&
    con_evidencias !== ""
  ) {
    const conEvidenciasBoolean =
      parseBoolean(
        con_evidencias,
        "con_evidencias",
      );

    where.total_evidencias =
      conEvidenciasBoolean
        ? {
          [Op.gt]: 0,
        }
        : {
          [Op.eq]: 0,
        };
  }

  // =========================================================
  // 6. BÚSQUEDA DE TEXTO
  // =========================================================

  if (
    search &&
    String(search).trim()
  ) {
    const searchValue =
      String(search).trim();

    where[Op.or] = [
      {
        descripcion: {
          [Op.like]:
            `%${searchValue}%`,
        },
      },
    ];
  }

  // =========================================================
  // 7. FILTRO POR UNIDAD
  // =========================================================

  const unidadIdNormalizado =
    unidad_id
      ? parsePositiveInteger(
        unidad_id,
        "unidad_id",
      )
      : null;

  const buildPatrullajeFilterInclude = () => {

    if (!unidadIdNormalizado) {
      return [];
    }

    return [
      {
        model:
          db.PatrullajeProgramado,
        as: "patrullaje",
        attributes: [],
        required: true,
        where: {
          unidad_id: unidadIdNormalizado,
        },
      },
    ];
  };

  // =========================================================
  // 8. EJECUTAR CONSULTAS
  // =========================================================
  const [
    total,
    totalReportadas,
    totalEnProceso,
    totalAtendidas,
    totalCerradas,
    totalEliminadas,
    totalConEvidencias,

    porTipo,
    porEstado,
    porZona,
    porFecha,

    detalleResult,
  ] = await Promise.all([

    // Total general
    db.Incidencia.count({
      where,
      include:
        buildPatrullajeFilterInclude(),
      distinct: true,
      col: "id",
    }),

    // REPORTADO
    db.Incidencia.count({
      where: {
        ...where,
        estado: "REPORTADO",
      },
      include:
        buildPatrullajeFilterInclude(),
      distinct: true,
      col: "id",
    }),

    // EN_PROCESO
    db.Incidencia.count({
      where: {
        ...where,
        estado: "EN_PROCESO",
      },
      include:
        buildPatrullajeFilterInclude(),
      distinct: true,
      col: "id",
    }),

    // ATENDIDO
    db.Incidencia.count({
      where: {
        ...where,
        estado: "ATENDIDO",
      },
      include:
        buildPatrullajeFilterInclude(),
      distinct: true,
      col: "id",
    }),

    // CERRADO
    db.Incidencia.count({
      where: {
        ...where,
        estado: "CERRADO",
      },
      include:
        buildPatrullajeFilterInclude(),
      distinct: true,
      col: "id",
    }),

    // ELIMINADO
    db.Incidencia.count({
      where: {
        ...where,
        estado: "ELIMINADO",
      },
      include:
        buildPatrullajeFilterInclude(),
      distinct: true,
      col: "id",
    }),

    // Con evidencias
    db.Incidencia.count({
      where: {
        ...where,
        total_evidencias: {
          [Op.gt]: 0,
        },
      },
      include:
        buildPatrullajeFilterInclude(),
      distinct: true,
      col: "id",
    }),

    // Agrupación por tipo
    db.Incidencia.findAll({
      attributes: [
        "tipo",
        [
          fn(
            "COUNT",
            col("Incidencia.id"),
          ),
          "total",
        ],
      ],
      where,
      include:
        buildPatrullajeFilterInclude(),
      group: [
        "Incidencia.tipo",
      ],
      order: [
        [
          fn(
            "COUNT",
            col("Incidencia.id"),
          ),
          "DESC",
        ],
      ],
      raw: true,
    }),

    // Agrupación por estado
    db.Incidencia.findAll({
      attributes: [
        "estado",
        [
          fn(
            "COUNT",
            col("Incidencia.id"),
          ),
          "total",
        ],
      ],
      where,
      include:
        buildPatrullajeFilterInclude(),
      group: [
        "Incidencia.estado",
      ],
      order: [
        [
          fn(
            "COUNT",
            col("Incidencia.id"),
          ),
          "DESC",
        ],
      ],
      raw: true,
    }),

    // Agrupación por zona
    db.Incidencia.findAll({
      attributes: [
        "zona_id",
        [
          col("zona.nombre"),
          "zona",
        ],

        [
          fn(
            "COUNT",
            col("Incidencia.id"),
          ),
          "total",
        ],
      ],
      where,
      include: [
        {
          model: db.Zonas,
          as: "zona",
          attributes: [],
          required: true,
        },

        ...buildPatrullajeFilterInclude(),
      ],
      group: [
        "Incidencia.zona_id",
        "zona.id",
        "zona.nombre",
      ],
      order: [
        [
          fn(
            "COUNT",
            col("Incidencia.id"),
          ),
          "DESC",
        ],
      ],
      raw: true,
    }),

    // Agrupación por fecha
    db.Incidencia.findAll({
      attributes: [
        [
          fn(
            "DATE",
            col(
              "Incidencia.fecha_hora",
            ),
          ),
          "fecha",
        ],
        [
          fn(
            "COUNT",
            col("Incidencia.id"),
          ),
          "total",
        ],
      ],
      where,
      include: buildPatrullajeFilterInclude(),
      group: [
        fn(
          "DATE",
          col(
            "Incidencia.fecha_hora",
          ),
        ),
      ],
      order: [
        [
          fn(
            "DATE",
            col(
              "Incidencia.fecha_hora",
            ),
          ),
          "ASC",
        ],
      ],
      raw: true,
    }),

    // Detalle paginado
    db.Incidencia.findAndCountAll({
      where,

      attributes: [
        "id",
        "usuario_id",
        "patrullaje_id",
        "zona_id",
        "tipo",
        "descripcion",
        "latitud",
        "longitud",
        "fecha_hora",
        "estado",
        "total_evidencias",
        "origen",
        "createdAt",
        "updatedAt",
      ],

      include: [
        {
          model: db.Usuario,
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
              model: db.Persona,
              as: "persona",
              required: false,
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
          model: db.Zonas,
          as: "zona",
          required: false,
          attributes: [
            "id",
            "nombre",
            "descripcion",
            "riesgo",
            "estado",
          ],
        },

        {
          model: db.PatrullajeProgramado,
          as: "patrullaje",
          required: Boolean(
            unidadIdNormalizado,
          ),
          where: unidadIdNormalizado
            ? {
              unidad_id:
                unidadIdNormalizado,
            }
            : undefined,
          attributes: [
            "id",
            "unidad_id",
            "zona_id",
            "fecha",
            "hora_inicio",
            "hora_fin",
            "estado",
          ],
          include: [
            {
              model: db.UnidadPatrullaje,
              as: "unidad",
              required: false,
              attributes: [
                "id",
                "codigo",
                "tipo",
                "placa",
                "estado",
              ],
            },
          ],
        },
      ],

      limit: limitNumber,
      offset,

      order: [
        [
          "fecha_hora",
          "DESC",
        ],
        [
          "id",
          "DESC",
        ],
      ],

      distinct: true,
    }),
  ]);

  // =========================================================
  // 9. NORMALIZAR RESULTADOS
  // =========================================================
  const totalItems = Number(detalleResult.count);
  const totalPages = Math.ceil(totalItems / limitNumber,);
  const totalEvidencias = detalleResult.rows.reduce(
    (acumulado, incidencia) =>
      acumulado +
      Number(
        incidencia.total_evidencias ??
        0,
      ),
    0,
  );

  return {
    resumen: {
      total: Number(total),
      reportadas: Number(totalReportadas),
      en_proceso: Number(totalEnProceso),
      atendidas: Number(totalAtendidas),
      cerradas: Number(totalCerradas),
      eliminadas: Number(totalEliminadas),
      con_evidencias: Number(totalConEvidencias),
      sin_evidencias: Math.max(
        Number(total) -
        Number(
          totalConEvidencias,
        ),
        0,
      ),
      evidencias_en_pagina: totalEvidencias,
    },

    por_tipo:
      porTipo.map(item => ({
        tipo: item.tipo,
        total: Number(item.total),
      })),

    por_estado:
      porEstado.map(item => ({
        estado: item.estado,
        total: Number(item.total),
      })),

    por_zona:
      porZona.map(item => ({
        zona_id: Number(item.zona_id),
        zona: item.zona,
        total: Number(item.total),
      })),

    por_fecha:
      porFecha.map(item => ({
        fecha: item.fecha,
        total: Number(item.total),
      })),

    detalle: {
      data: detalleResult.rows,

      pagination: {
        page: pageNumber,
        limit: limitNumber,
        totalItems,
        totalPages,
        hasNextPage: pageNumber < totalPages,
        hasPreviousPage: pageNumber > 1,
      },
    },

    filters: {
      fecha_inicio: fecha_inicio || null,
      fecha_fin: fecha_fin || null,

      usuario_id: usuario_id
        ? Number(usuario_id)
        : null,

      patrullaje_id: patrullaje_id
        ? Number(patrullaje_id)
        : null,

      zona_id: zona_id
        ? Number(zona_id)
        : null,

      unidad_id: unidadIdNormalizado,
      tipo: tipoNormalizado,
      estado: estadoNormalizado,
      origen: origenNormalizado,
      con_evidencias: con_evidencias === undefined ||
        con_evidencias === null ||
        con_evidencias === ""
        ? null
        : parseBoolean(
          con_evidencias,
          "con_evidencias",
        ),

      search: search
        ? String(search).trim()
        : null,
    },
  };
};


module.exports = reporteIncidenciasService;