const { Op, fn, col, } = require("sequelize");
const db = require("../../../database/models");

// Utils
const {
  buildPorFecha,
  buildPorSereno,
  buildPorUnidad,
  buildPorZona,
} = require("../utils/actividades_operativas/build_data.utils")

const {
  buildEmptyResponse,
  createMapByPatrullaje,
  createServiceError,
  createTotalMap,
  normalizeDateOnly,
  parseNullableBoolean,
  parsePositiveInteger,
} = require("../utils/actividades_operativas/actividadesO.utils");

// ENUMS
const ESTADOS_PATRULLAJE = [
  "PROGRAMADO",
  "ASIGNADO",
  "ACEPTADO",
  "EN_CURSO",
  "FINALIZADO",
];

const ESTADOS_ASIGNACION = [
  "ASIGNADO",
  "ACEPTADO",
  "RECHAZADO",
  "EN_SERVICIO",
  "FINALIZADO",
];

/**
 * Genera el reporte de actividad operativa.
 *
 * Filtros admitidos:
 * - page
 * - limit
 * - fecha_inicio
 * - fecha_fin
 * - patrullaje_id
 * - zona_id
 * - unidad_id
 * - usuario_id
 * - estado_patrullaje
 * - estado_asignacion
 * - solo_con_incidencias
 * - solo_finalizados
 * - search
 */
const reporteActividadOperativaService = async ({
  page = 1,
  limit = 10,

  fecha_inicio,
  fecha_fin,

  patrullaje_id,
  zona_id,
  unidad_id,
  usuario_id,

  estado_patrullaje,
  estado_asignacion,

  solo_con_incidencias,
  solo_finalizados,

  search,
} = {}) => {

  // =========================================================
  // 1. PAGINACIÓN
  // =========================================================
  const pageNumber = Math.max(Number.parseInt(page, 10) || 1, 1,);
  const limitNumber = Math.min(Math.max(Number.parseInt(limit, 10) || 10, 1,), 100,);

  const offset = (pageNumber - 1) * limitNumber;

  // =========================================================
  // 2. VALIDAR FILTROS
  // =========================================================
  const patrullajeId = patrullaje_id
    ? parsePositiveInteger(
      patrullaje_id,
      "patrullaje_id",
    )
    : null;

  const zonaId = zona_id
    ? parsePositiveInteger(
      zona_id,
      "zona_id",
    )
    : null;

  const unidadId = unidad_id
    ? parsePositiveInteger(
      unidad_id,
      "unidad_id",
    )
    : null;

  const usuarioId = usuario_id
    ? parsePositiveInteger(
      usuario_id,
      "usuario_id",
    )
    : null;

  const estadoPatrullaje = estado_patrullaje
    ? String(
      estado_patrullaje,
    )
      .trim()
      .toUpperCase()
    : null;

  const estadoAsignacion = estado_asignacion
    ? String(
      estado_asignacion,
    )
      .trim()
      .toUpperCase()
    : null;

  if (estadoPatrullaje && !ESTADOS_PATRULLAJE.includes(estadoPatrullaje,)) {
    throw createServiceError(
      `estado_patrullaje no válido. Valores permitidos: ${ESTADOS_PATRULLAJE.join(", ")}.`,
      400,
    );
  }

  if (estadoAsignacion && !ESTADOS_ASIGNACION.includes(estadoAsignacion,)) {
    throw createServiceError(
      `estado_asignacion no válido. Valores permitidos: ${ESTADOS_ASIGNACION.join(", ")}.`,
      400,
    );
  }

  const soloConIncidencias = parseNullableBoolean(solo_con_incidencias, "solo_con_incidencias",);
  const soloFinalizados = parseNullableBoolean(solo_finalizados, "solo_finalizados",);

  // =========================================================
  // 3. WHERE DE PATRULLAJE
  // =========================================================
  const patrullajeWhere = {};

  if (patrullajeId) {
    patrullajeWhere.id =
      patrullajeId;
  }

  if (zonaId) {
    patrullajeWhere.zona_id =
      zonaId;
  }

  if (unidadId) {
    patrullajeWhere.unidad_id =
      unidadId;
  }

  if (estadoPatrullaje) {
    patrullajeWhere.estado =
      estadoPatrullaje;
  }

  if (soloFinalizados === true) {
    patrullajeWhere.estado =
      "FINALIZADO";
  }

  // =========================================================
  // 4. FILTRO POR FECHA
  // =========================================================
  const fechaInicio = normalizeDateOnly(fecha_inicio, "fecha_inicio",);
  const fechaFin = normalizeDateOnly(fecha_fin, "fecha_fin",);

  if (fechaInicio && fechaFin && fechaInicio > fechaFin) {
    throw createServiceError(
      "La fecha inicial no puede ser posterior a la fecha final.",
      400,
    );
  }

  if (fechaInicio && fechaFin) {
    patrullajeWhere.fecha = {
      [Op.between]: [
        fechaInicio,
        fechaFin,
      ],
    };
  } else if (fechaInicio) {
    patrullajeWhere.fecha = {
      [Op.gte]: fechaInicio,
    };
  } else if (fechaFin) {
    patrullajeWhere.fecha = {
      [Op.lte]: fechaFin,
    };
  }

  if (search && String(search).trim()) {
    const searchValue =
      String(search).trim();

    patrullajeWhere[Op.or] = [
      {
        descripcion: {
          [Op.like]:
            `%${searchValue}%`,
        },
      },
    ];
  }

  // =========================================================
  // 5. FILTRO POR PERSONAL
  // =========================================================
  const personalWhere = {};

  if (usuarioId) {
    personalWhere.usuario_id = usuarioId;
    personalWhere.tipo_personal = "SERENO";
  }

  if (estadoAsignacion) {
    personalWhere.estado = estadoAsignacion;
  }

  const requiereFiltroPersonal = Object.keys(personalWhere,).length > 0;

  const personalFilterInclude = requiereFiltroPersonal ? [
    {
      model: db.PatrullajePersonal,
      as: "personal",
      attributes: [],
      required: true,
      where: personalWhere,
    },
  ]
    : [];

  // =========================================================
  // 6. OBTENER PATRULLAJES BASE
  // =========================================================
  const patrullajesBase = await db.PatrullajeProgramado.findAll({
    where: patrullajeWhere,
    attributes: [
      "id",
      "unidad_id",
      "zona_id",
      "fecha",
      "hora_inicio",
      "hora_fin",
      "estado",
      "descripcion",
      "createdAt",
      "updatedAt",
    ],

    include: personalFilterInclude,

    order: [["fecha", "DESC"],
    ["hora_inicio", "DESC"],
    ["id", "DESC"],
    ],

    distinct: true,
  });

  let patrullajeIds = patrullajesBase.map(item => item.id,);

  // =========================================================
  // 7. FILTRAR SOLO CON INCIDENCIAS
  // =========================================================
  if (soloConIncidencias !== null) {

    const incidenciasAgrupadas = patrullajeIds.length > 0
      ? await db.Incidencia.findAll({
        attributes: [
          "patrullaje_id",
          [
            fn("COUNT", col("id"),), "total",
          ],
        ],

        where: {
          patrullaje_id: {
            [Op.in]:
              patrullajeIds,
          },

          estado: {
            [Op.ne]:
              "ELIMINADO",
          },
        },

        group: [
          "patrullaje_id",
        ],

        raw: true,
      })
      : [];

    const idsConIncidencias = new Set(incidenciasAgrupadas.map(item =>
      Number(
        item.patrullaje_id,
      ),
    ),
    );

    patrullajeIds = patrullajeIds.filter(id =>
      soloConIncidencias
        ? idsConIncidencias.has(
          id,
        )
        : !idsConIncidencias.has(
          id,
        ),
    );
  }

  // =========================================================
  // 8. RESPUESTA VACÍA
  // =========================================================
  if (patrullajeIds.length === 0) {
    return buildEmptyResponse({
      pageNumber,
      limitNumber,

      filters: {
        fecha_inicio: fechaInicio,
        fecha_fin: fechaFin,
        patrullaje_id: patrullajeId,
        zona_id: zonaId,
        unidad_id: unidadId,
        usuario_id: usuarioId,
        estado_patrullaje: estadoPatrullaje,
        estado_asignacion: estadoAsignacion,
        solo_con_incidencias: soloConIncidencias,
        solo_finalizados: soloFinalizados,
        search: search
          ? String(search).trim()
          : null,
      },
    });
  }

  // =========================================================
  // 9. CONSULTAS CONSOLIDADAS
  // =========================================================
  const [
    resumenes,
    incidenciasAgrupadas,
    historialesAgrupados,
    alertasAgrupadas,
    gpsAgrupado,
    personal,
  ] = await Promise.all([

    // Resumen final del patrullaje
    db.PatrullajeResumen.findAll({
      where: {
        patrullaje_id: {
          [Op.in]:
            patrullajeIds,
        },
      },

      raw: true,
    }),

    // Incidencias por patrullaje
    db.Incidencia.findAll({
      attributes: [
        "patrullaje_id",

        [
          fn(
            "COUNT",
            col("id"),
          ),
          "total",
        ],
      ],

      where: {
        patrullaje_id: {
          [Op.in]:
            patrullajeIds,
        },

        estado: {
          [Op.ne]:
            "ELIMINADO",
        },
      },

      group: [
        "patrullaje_id",
      ],

      raw: true,
    }),

    // Historiales por patrullaje
    db.HistorialPatrullaje.findAll({
      attributes: [
        "patrullaje_id",

        [
          fn(
            "COUNT",
            col("id"),
          ),
          "total",
        ],
      ],

      where: {
        patrullaje_id: {
          [Op.in]:
            patrullajeIds,
        },
      },

      group: [
        "patrullaje_id",
      ],

      raw: true,
    }),

    // Alertas por patrullaje
    db.Alerta.findAll({
      attributes: [
        "patrullaje_id",

        [
          fn(
            "COUNT",
            col("id"),
          ),
          "total",
        ],
      ],

      where: {
        patrullaje_id: {
          [Op.in]:
            patrullajeIds,
        },
      },

      group: [
        "patrullaje_id",
      ],

      raw: true,
    }),

    // Puntos GPS por patrullaje
    db.PatrullajeGps.findAll({
      attributes: [
        "patrullaje_id",

        [
          fn(
            "COUNT",
            col("id"),
          ),
          "total_puntos",
        ],

        [
          fn(
            "AVG",
            col("velocidad"),
          ),
          "velocidad_promedio",
        ],

        [
          fn(
            "MAX",
            col("velocidad"),
          ),
          "velocidad_maxima",
        ],

        [
          fn(
            "MIN",
            col("fecha_hora"),
          ),
          "primer_reporte",
        ],

        [
          fn(
            "MAX",
            col("fecha_hora"),
          ),
          "ultimo_reporte",
        ],
      ],

      where: {
        patrullaje_id: {
          [Op.in]:
            patrullajeIds,
        },
      },

      group: [
        "patrullaje_id",
      ],

      raw: true,
    }),

    // Personal asignado
    db.PatrullajePersonal.findAll({
      where: {
        patrullaje_id: {
          [Op.in]:
            patrullajeIds,
        },
      },

      include: [
        {
          model:
            db.Usuario,

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
              model:
                db.Persona,

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
      ],
    }),
  ]);

  // =========================================================
  // 10. CREAR MAPAS DE APOYO
  // =========================================================
  const resumenMap = createMapByPatrullaje(resumenes,);
  const incidenciaMap = createTotalMap(incidenciasAgrupadas, "total",);
  const historialMap = createTotalMap(historialesAgrupados, "total",);
  const alertaMap = createTotalMap(alertasAgrupadas, "total",);

  const gpsMap = new Map(
    gpsAgrupado.map(
      item => [
        Number(item.patrullaje_id,),
        {
          total_puntos: Number(item.total_puntos ?? 0,),
          velocidad_promedio: item.velocidad_promedio !== null ? Number(item.velocidad_promedio,) : null,
          velocidad_maxima: item.velocidad_maxima !== null ? Number(item.velocidad_maxima,) : null,
          primer_reporte: item.primer_reporte ?? null,
          ultimo_reporte: item.ultimo_reporte ?? null,
        },
      ],
    ),
  );

  const personalMap = new Map();

  for (const asignacion of personal) {

    const patrullajeIdActual = Number(asignacion.patrullaje_id,);

    if (!personalMap.has(patrullajeIdActual,)) {
      personalMap.set(patrullajeIdActual, [],);
    }

    personalMap.get(patrullajeIdActual,)
      .push(
        asignacion,
      );
  }

  // =========================================================
  // 11. INFORMACIÓN DE ZONA Y UNIDAD
  // =========================================================
  const patrullajesCompletos =
    await db.PatrullajeProgramado.findAll({
      where: {
        id: {
          [Op.in]:
            patrullajeIds,
        },
      },

      attributes: [
        "id",
        "unidad_id",
        "zona_id",
        "fecha",
        "hora_inicio",
        "hora_fin",
        "estado",
        "descripcion",
        "createdAt",
        "updatedAt",
      ],

      include: [
        {
          model:
            db.Zonas,

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
          model:
            db.UnidadPatrullaje,

          as: "unidad",

          required: false,

          attributes: [
            "id",
            "codigo",
            "tipo",
            "placa",
            "estado",
            "descripcion",
          ],
        },
      ],

      order: [
        ["fecha", "DESC"],
        ["hora_inicio", "DESC"],
        ["id", "DESC"],
      ],
    });

  // =========================================================
  // 12. NORMALIZAR DETALLE COMPLETO
  // =========================================================
  const detalleCompleto = patrullajesCompletos.map(
    patrullaje => {

      const id = Number(patrullaje.id,);

      const resumen = resumenMap.get(id) ?? null;

      const gps = gpsMap.get(id) ?? {
        total_puntos: 0,
        velocidad_promedio: null,
        velocidad_maxima: null,
        primer_reporte: null,
        ultimo_reporte: null,
      };

      const asignaciones = personalMap.get(id) ?? [];

      return {
        id: patrullaje.id,
        unidad_id: patrullaje.unidad_id,
        zona_id: patrullaje.zona_id,
        fecha: patrullaje.fecha,
        hora_inicio: patrullaje.hora_inicio,
        hora_fin: patrullaje.hora_fin,
        estado: patrullaje.estado,
        descripcion: patrullaje.descripcion,
        zona: patrullaje.zona,
        unidad: patrullaje.unidad,
        personal: asignaciones,
        resumen: {
          fecha_inicio: resumen?.fecha_inicio ?? null,
          fecha_fin: resumen?.fecha_fin ?? null,
          duracion_segundos: Number(resumen?.duracion_segundos ?? 0,),
          distancia_total_metros: Number(resumen?.distancia_total_metros ?? 0,),
          total_puntos_recorrido: Number(resumen?.total_puntos_recorrido ?? gps.total_puntos ?? 0,),
          total_incidencias: incidenciaMap.get(id) ?? Number(resumen?.total_incidencias ?? 0,),
          total_observaciones: Number(resumen?.total_observaciones ?? 0,),
          observacion_final:
            resumen
              ?.observacion_final ??
            null,
        },

        actividad: {
          incidencias: incidenciaMap.get(id) ?? 0,
          historiales: historialMap.get(id) ?? 0,
          alertas: alertaMap.get(id) ?? 0,
          puntos_gps: gps.total_puntos,
          velocidad_promedio: gps.velocidad_promedio,
          velocidad_maxima: gps.velocidad_maxima,
          primer_reporte_gps: gps.primer_reporte,
          ultimo_reporte_gps: gps.ultimo_reporte,
        },
        createdAt: patrullaje.createdAt,
        updatedAt: patrullaje.updatedAt,
      };
    },
  );

  // =========================================================
  // 13. RESUMEN GENERAL
  // =========================================================
  const resumenGeneral = detalleCompleto.reduce(
    (
      acumulado,
      patrullaje,
    ) => {

      acumulado.total_patrullajes += 1;

      switch (
      patrullaje.estado
      ) {
        case "PROGRAMADO":
          acumulado.programados +=
            1;
          break;

        case "ASIGNADO":
          acumulado.asignados +=
            1;
          break;

        case "ACEPTADO":
          acumulado.aceptados +=
            1;
          break;

        case "EN_CURSO":
          acumulado.en_curso +=
            1;
          break;

        case "FINALIZADO":
          acumulado.finalizados +=
            1;
          break;
      }

      acumulado.duracion_total_segundos +=
        patrullaje
          .resumen
          .duracion_segundos;

      acumulado.distancia_total_metros +=
        patrullaje
          .resumen
          .distancia_total_metros;

      acumulado.total_puntos_gps +=
        patrullaje
          .actividad
          .puntos_gps;

      acumulado.incidencias_registradas +=
        patrullaje
          .actividad
          .incidencias;

      acumulado.historiales_registrados +=
        patrullaje
          .actividad
          .historiales;

      acumulado.alertas_generadas +=
        patrullaje
          .actividad
          .alertas;

      return acumulado;
    },
    {
      total_patrullajes: 0,

      programados: 0,
      asignados: 0,
      aceptados: 0,
      en_curso: 0,
      finalizados: 0,

      duracion_total_segundos:
        0,

      distancia_total_metros:
        0,

      total_puntos_gps:
        0,

      incidencias_registradas:
        0,

      historiales_registrados:
        0,

      alertas_generadas:
        0,
    },
  );

  resumenGeneral.horas_operativas =
    Number(
      (
        resumenGeneral
          .duracion_total_segundos /
        3600
      ).toFixed(2),
    );

  resumenGeneral.distancia_total_km =
    Number(
      (
        resumenGeneral
          .distancia_total_metros /
        1000
      ).toFixed(2),
    );

  // =========================================================
  // 14. AGRUPACIONES
  // =========================================================

  const porSereno =
    buildPorSereno(
      detalleCompleto,
    );

  const porUnidad =
    buildPorUnidad(
      detalleCompleto,
    );

  const porZona =
    buildPorZona(
      detalleCompleto,
    );

  const porFecha =
    buildPorFecha(
      detalleCompleto,
    );

  // =========================================================
  // 15. PAGINAR DETALLE
  // =========================================================

  const totalItems =
    detalleCompleto.length;

  const totalPages =
    Math.ceil(
      totalItems /
      limitNumber,
    );

  const detallePaginado =
    detalleCompleto.slice(
      offset,
      offset + limitNumber,
    );

  return {
    resumen: resumenGeneral,
    por_sereno: porSereno,
    por_unidad: porUnidad,
    por_zona: porZona,
    por_fecha: porFecha,
    detalle: {
      data: detallePaginado,
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
      fecha_inicio: fechaInicio,
      fecha_fin: fechaFin,
      patrullaje_id: patrullajeId,
      zona_id: zonaId,
      unidad_id: unidadId,
      usuario_id: usuarioId,
      estado_patrullaje: estadoPatrullaje,
      estado_asignacion: estadoAsignacion,
      solo_con_incidencias: soloConIncidencias,
      solo_finalizados: soloFinalizados,
      search: search
        ? String(search).trim()
        : null,
    },
  };
};


module.exports = reporteActividadOperativaService;