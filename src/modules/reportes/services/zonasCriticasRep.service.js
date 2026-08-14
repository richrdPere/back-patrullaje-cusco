const { Op, fn, col, } = require("sequelize");
const db = require("../../../database/models");


// Utils
const {
  buildPorFecha,
  buildPuntosGeograficos,
  calcularNivelCriticidad,
  calcularPuntajeAlertas,
  calcularPuntajeHistoriales,
  calcularPuntajeIncidencias,
} = require("../utils/zonas_criticas/puntos_criticos.utils");

const {
  applyDateRange,
  applyPatrullajeFilter,
  buildEmptyResponse,
  buildFiltersResponse,
  countByField,
  createServiceError,
  formatDateOnly,
  getPredominantValue,
  groupByZona,
  hasValidCoordinates,
  normalizeEndDate,
  normalizeEnum,
  normalizeStartDate,
  obtenerUltimaActividad,
  parseBoolean,
} = require("../utils/zonas_criticas/zonas_criticas.utils");


// =========================================================
// VALORES VÁLIDOS
// =========================================================

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

const PRIORIDADES = [
  "BAJA",
  "MEDIA",
  "ALTA",
  "CRITICA",
];

const TIPOS_ALERTA = [
  "PANICO",
  "INCIDENCIA",
  "EMERGENCIA",
  "SOS",
  "INFORMATIVA",
  "PREVENTIVA",
  "CAMBIO_RUTA",
  "APOYO_REQUERIDO",
  "MENSAJE_CENTRAL",
];

const ESTADOS_ALERTA = [
  "PENDIENTE",
  "EN_ATENCION",
  "ATENDIDA",
  "CANCELADA",
  "EXPIRADA",
];

const NIVELES_CRITICIDAD = [
  "BAJO",
  "MEDIO",
  "ALTO",
  "CRITICO",
];


// =========================================================
// SERVICE
// =========================================================

/**
 * Genera el reporte de zonas críticas.
 *
 * Filtros admitidos:
 * - fecha_inicio
 * - fecha_fin
 * - zona_id
 * - unidad_id
 * - patrullaje_id
 * - usuario_id
 * - tipo_incidencia
 * - estado_incidencia
 * - prioridad
 * - tipo_alerta
 * - estado_alerta
 * - nivel_criticidad
 * - incluir_sin_eventos
 * - incluir_puntos
 * - limite
 */
const reporteZonasCriticasService = async ({
  fecha_inicio,
  fecha_fin,

  zona_id,
  unidad_id,
  patrullaje_id,
  usuario_id,

  tipo_incidencia,
  estado_incidencia,

  prioridad,
  tipo_alerta,
  estado_alerta,

  nivel_criticidad,

  incluir_sin_eventos = false,
  incluir_puntos = true,

  limite = 20,
} = {}) => {

  // =========================================================
  // 1. NORMALIZAR FILTROS
  // =========================================================

  const fechaInicio = normalizeStartDate(
    fecha_inicio,
    "fecha_inicio",
  );

  const fechaFin = normalizeEndDate(
    fecha_fin,
    "fecha_fin",
  );

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

  const zonaId = zona_id
    ? parsePositiveInteger(zona_id, "zona_id")
    : null;

  const unidadId = unidad_id
    ? parsePositiveInteger(unidad_id, "unidad_id")
    : null;

  const patrullajeId = patrullaje_id
    ? parsePositiveInteger(
      patrullaje_id,
      "patrullaje_id",
    )
    : null;

  const usuarioId = usuario_id
    ? parsePositiveInteger(
      usuario_id,
      "usuario_id",
    )
    : null;

  const limiteNormalizado = Math.min(
    Math.max(
      Number.parseInt(limite, 10) || 20,
      1,
    ),
    100,
  );

  const tipoIncidencia = normalizeEnum(
    tipo_incidencia,
    TIPOS_INCIDENCIA,
    "tipo_incidencia",
  );

  const estadoIncidencia = normalizeEnum(
    estado_incidencia,
    ESTADOS_INCIDENCIA,
    "estado_incidencia",
  );

  const prioridadNormalizada = normalizeEnum(
    prioridad,
    PRIORIDADES,
    "prioridad",
  );

  const tipoAlerta = normalizeEnum(
    tipo_alerta,
    TIPOS_ALERTA,
    "tipo_alerta",
  );

  const estadoAlerta = normalizeEnum(
    estado_alerta,
    ESTADOS_ALERTA,
    "estado_alerta",
  );

  const nivelCriticidad = normalizeEnum(
    nivel_criticidad,
    NIVELES_CRITICIDAD,
    "nivel_criticidad",
  );

  const incluirSinEventos = parseBoolean(
    incluir_sin_eventos,
    "incluir_sin_eventos",
  );

  const incluirPuntos = parseBoolean(
    incluir_puntos,
    "incluir_puntos",
  );

  // =========================================================
  // 2. OBTENER PATRULLAJES FILTRADOS
  // =========================================================

  let patrullajeIdsFiltrados = null;

  if (
    unidadId ||
    patrullajeId
  ) {
    const patrullajeWhere = {};

    if (unidadId) {
      patrullajeWhere.unidad_id = unidadId;
    }

    if (patrullajeId) {
      patrullajeWhere.id = patrullajeId;
    }

    const patrullajes =
      await db.PatrullajeProgramado.findAll({
        attributes: ["id"],
        where: patrullajeWhere,
        raw: true,
      });

    patrullajeIdsFiltrados =
      patrullajes.map(item => Number(item.id));

    if (patrullajeIdsFiltrados.length === 0) {
      return buildEmptyResponse({
        filters: buildFiltersResponse({
          fechaInicio,
          fechaFin,
          zonaId,
          unidadId,
          patrullajeId,
          usuarioId,
          tipoIncidencia,
          estadoIncidencia,
          prioridadNormalizada,
          tipoAlerta,
          estadoAlerta,
          nivelCriticidad,
          incluirSinEventos,
          incluirPuntos,
          limiteNormalizado,
        }),
      });
    }
  }

  // =========================================================
  // 3. WHERE DE ZONAS
  // =========================================================

  const zonaWhere = {};

  if (zonaId) {
    zonaWhere.id = zonaId;
  }

  const zonas = await db.Zonas.findAll({
    where: zonaWhere,

    attributes: [
      "id",
      "nombre",
      "descripcion",
      "coordenadas",
      "riesgo",
      "estado",
      "createdAt",
      "updatedAt",
    ],

    order: [
      ["nombre", "ASC"],
    ],
  });

  if (zonas.length === 0) {
    return buildEmptyResponse({
      filters: buildFiltersResponse({
        fechaInicio,
        fechaFin,
        zonaId,
        unidadId,
        patrullajeId,
        usuarioId,
        tipoIncidencia,
        estadoIncidencia,
        prioridadNormalizada,
        tipoAlerta,
        estadoAlerta,
        nivelCriticidad,
        incluirSinEventos,
        incluirPuntos,
        limiteNormalizado,
      }),
    });
  }

  const zonaIds = zonas.map(
    zona => Number(zona.id),
  );

  // =========================================================
  // 4. WHERE DE INCIDENCIAS
  // =========================================================

  const incidenciaWhere = {
    zona_id: {
      [Op.in]: zonaIds,
    },
  };

  applyDateRange(
    incidenciaWhere,
    "fecha_hora",
    fechaInicio,
    fechaFin,
  );

  if (usuarioId) {
    incidenciaWhere.usuario_id = usuarioId;
  }

  if (tipoIncidencia) {
    incidenciaWhere.tipo = tipoIncidencia;
  }

  if (estadoIncidencia) {
    incidenciaWhere.estado = estadoIncidencia;
  } else {
    incidenciaWhere.estado = {
      [Op.ne]: "ELIMINADO",
    };
  }

  applyPatrullajeFilter(
    incidenciaWhere,
    patrullajeIdsFiltrados,
  );

  // =========================================================
  // 5. WHERE DE HISTORIAL
  // =========================================================

  const historialWhere = {
    zona_id: {
      [Op.in]: zonaIds,
    },
  };

  applyDateRange(
    historialWhere,
    "fecha_hora",
    fechaInicio,
    fechaFin,
  );

  if (usuarioId) {
    historialWhere.usuario_id = usuarioId;
  }

  if (prioridadNormalizada) {
    historialWhere.prioridad =
      prioridadNormalizada;
  }

  applyPatrullajeFilter(
    historialWhere,
    patrullajeIdsFiltrados,
  );

  // =========================================================
  // 6. WHERE DE ALERTAS
  // =========================================================

  const alertaWhere = {
    zona_id: {
      [Op.in]: zonaIds,
    },
  };

  /*
   * Alerta no tiene fecha_hora; utiliza createdAt.
   */
  applyDateRange(
    alertaWhere,
    "createdAt",
    fechaInicio,
    fechaFin,
  );

  if (usuarioId) {
    alertaWhere.emisor_id = usuarioId;
  }

  if (prioridadNormalizada) {
    alertaWhere.prioridad =
      prioridadNormalizada;
  }

  if (tipoAlerta) {
    alertaWhere.tipo = tipoAlerta;
  }

  if (estadoAlerta) {
    alertaWhere.estado = estadoAlerta;
  } else {
    alertaWhere.estado = {
      [Op.notIn]: [
        "CANCELADA",
        "EXPIRADA",
      ],
    };
  }

  applyPatrullajeFilter(
    alertaWhere,
    patrullajeIdsFiltrados,
  );

  // =========================================================
  // 7. CONSULTAR EVENTOS
  // =========================================================

  const [
    incidencias,
    historiales,
    alertas,
  ] = await Promise.all([

    db.Incidencia.findAll({
      where: incidenciaWhere,

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
      ],

      order: [
        ["fecha_hora", "DESC"],
      ],
    }),

    db.HistorialPatrullaje.findAll({
      where: historialWhere,

      attributes: [
        "id",
        "patrullaje_id",
        "usuario_id",
        "zona_id",
        "incidencia_id",
        "tipo",
        "titulo",
        "descripcion",
        "prioridad",
        "latitud",
        "longitud",
        "visible_para_siguiente_turno",
        "fecha_hora",
        "estado",
      ],

      order: [
        ["fecha_hora", "DESC"],
      ],
    }),

    db.Alerta.findAll({
      where: alertaWhere,

      attributes: [
        "id",
        "emisor_id",
        "patrullaje_id",
        "zona_id",
        "incidencia_id",
        "titulo",
        "tipo",
        "prioridad",
        "descripcion",
        "latitud",
        "longitud",
        "requiere_confirmacion",
        "fecha_expiracion",
        "estado",
        "createdAt",
      ],

      order: [
        ["createdAt", "DESC"],
      ],
    }),
  ]);

  // =========================================================
  // 8. ORGANIZAR EVENTOS POR ZONA
  // =========================================================

  const incidenciasMap = groupByZona(
    incidencias,
  );

  const historialesMap = groupByZona(
    historiales,
  );

  const alertasMap = groupByZona(
    alertas,
  );

  // =========================================================
  // 9. CONSTRUIR RANKING
  // =========================================================

  let ranking = zonas.map(zona => {

    const id = Number(zona.id);

    const incidenciasZona =
      incidenciasMap.get(id) ?? [];

    const historialesZona =
      historialesMap.get(id) ?? [];

    const alertasZona =
      alertasMap.get(id) ?? [];

    const incidenciasPorTipo =
      countByField(
        incidenciasZona,
        "tipo",
      );

    const incidenciasPorEstado =
      countByField(
        incidenciasZona,
        "estado",
      );

    const historialesPorTipo =
      countByField(
        historialesZona,
        "tipo",
      );

    const alertasPorTipo =
      countByField(
        alertasZona,
        "tipo",
      );

    const alertasPorPrioridad =
      countByField(
        alertasZona,
        "prioridad",
      );

    const puntajeIncidencias =
      calcularPuntajeIncidencias(
        incidenciasZona,
      );

    const puntajeHistoriales =
      calcularPuntajeHistoriales(
        historialesZona,
      );

    const puntajeAlertas =
      calcularPuntajeAlertas(
        alertasZona,
      );

    const puntajeTotal =
      puntajeIncidencias +
      puntajeHistoriales +
      puntajeAlertas;

    const nivelCalculado =
      calcularNivelCriticidad(
        puntajeTotal,
      );

    const totalEventos =
      incidenciasZona.length +
      historialesZona.length +
      alertasZona.length;

    const ultimaActividad =
      obtenerUltimaActividad([
        ...incidenciasZona.map(item => ({
          fecha: item.fecha_hora,
        })),

        ...historialesZona.map(item => ({
          fecha: item.fecha_hora,
        })),

        ...alertasZona.map(item => ({
          fecha: item.createdAt,
        })),
      ]);

    return {
      posicion: 0,

      zona_id: id,
      zona: zona.nombre,
      descripcion: zona.descripcion,

      riesgo_configurado: zona.riesgo,
      estado_zona: zona.estado,

      coordenadas: zona.coordenadas,

      total_eventos: totalEventos,

      total_incidencias:
        incidenciasZona.length,

      total_historiales:
        historialesZona.length,

      total_alertas:
        alertasZona.length,

      puntos_criticos:
        historialesZona.filter(
          item =>
            item.tipo ===
            "PUNTO_CRITICO",
        ).length,

      alertas_emergencia:
        alertasZona.filter(
          item =>
            TIPOS_ALERTA_EMERGENCIA
              .includes(item.tipo),
        ).length,

      incidencias_por_tipo:
        incidenciasPorTipo,

      incidencias_por_estado:
        incidenciasPorEstado,

      historiales_por_tipo:
        historialesPorTipo,

      alertas_por_tipo:
        alertasPorTipo,

      alertas_por_prioridad:
        alertasPorPrioridad,

      tipo_incidencia_predominante:
        getPredominantValue(
          incidenciasPorTipo,
        ),

      tipo_alerta_predominante:
        getPredominantValue(
          alertasPorTipo,
        ),

      puntaje: {
        incidencias:
          puntajeIncidencias,

        historiales:
          puntajeHistoriales,

        alertas:
          puntajeAlertas,

        total:
          puntajeTotal,
      },

      nivel_criticidad:
        nivelCalculado,

      ultima_actividad:
        ultimaActividad,

      puntos_geograficos:
        incluirPuntos
          ? buildPuntosGeograficos({
            incidencias:
              incidenciasZona,

            historiales:
              historialesZona,

            alertas:
              alertasZona,
          })
          : [],
    };
  });

  // =========================================================
  // 10. FILTRAR ZONAS
  // =========================================================

  if (!incluirSinEventos) {
    ranking = ranking.filter(
      item => item.total_eventos > 0,
    );
  }

  if (nivelCriticidad) {
    ranking = ranking.filter(
      item =>
        item.nivel_criticidad ===
        nivelCriticidad,
    );
  }

  // =========================================================
  // 11. ORDENAR Y LIMITAR
  // =========================================================

  ranking.sort((a, b) => {
    if (b.puntaje.total !== a.puntaje.total) {
      return (
        b.puntaje.total -
        a.puntaje.total
      );
    }

    return (
      b.total_eventos -
      a.total_eventos
    );
  });

  ranking = ranking
    .slice(0, limiteNormalizado)
    .map((item, index) => ({
      ...item,
      posicion: index + 1,
    }));

  // =========================================================
  // 12. RESUMEN GENERAL
  // =========================================================

  const resumen = ranking.reduce(
    (accumulator, zona) => {

      accumulator.zonas_analizadas += 1;

      accumulator.total_eventos +=
        zona.total_eventos;

      accumulator.total_incidencias +=
        zona.total_incidencias;

      accumulator.total_historiales +=
        zona.total_historiales;

      accumulator.total_alertas +=
        zona.total_alertas;

      accumulator.total_puntos_criticos +=
        zona.puntos_criticos;

      accumulator.total_alertas_emergencia +=
        zona.alertas_emergencia;

      accumulator.puntaje_total +=
        zona.puntaje.total;

      switch (zona.nivel_criticidad) {
        case "BAJO":
          accumulator.zonas_bajas += 1;
          break;

        case "MEDIO":
          accumulator.zonas_medias += 1;
          break;

        case "ALTO":
          accumulator.zonas_altas += 1;
          break;

        case "CRITICO":
          accumulator.zonas_criticas += 1;
          break;
      }

      return accumulator;
    },
    {
      zonas_analizadas: 0,

      zonas_bajas: 0,
      zonas_medias: 0,
      zonas_altas: 0,
      zonas_criticas: 0,

      total_eventos: 0,
      total_incidencias: 0,
      total_historiales: 0,
      total_alertas: 0,

      total_puntos_criticos: 0,
      total_alertas_emergencia: 0,

      puntaje_total: 0,
    },
  );

  const zonaMasCritica =
    ranking.length > 0
      ? {
        zona_id:
          ranking[0].zona_id,

        zona:
          ranking[0].zona,

        nivel_criticidad:
          ranking[0]
            .nivel_criticidad,

        puntaje:
          ranking[0]
            .puntaje
            .total,

        total_eventos:
          ranking[0]
            .total_eventos,
      }
      : null;

  // =========================================================
  // 13. DISTRIBUCIÓN POR FECHA
  // =========================================================

  const porFecha = buildPorFecha({
    incidencias,
    historiales,
    alertas,
  });

  return {
    criterio: {
      descripcion:
        "La criticidad se calcula a partir de incidencias, historiales operativos y alertas registradas en cada zona.",

      niveles: {
        BAJO: {
          min: 0,
          max: 4,
        },

        MEDIO: {
          min: 5,
          max: 9,
        },

        ALTO: {
          min: 10,
          max: 19,
        },

        CRITICO: {
          min: 20,
          max: null,
        },
      },
    },

    resumen: {
      ...resumen,
      zona_mas_critica:
        zonaMasCritica,
    },

    ranking,

    por_fecha: porFecha,

    filters: buildFiltersResponse({
      fechaInicio,
      fechaFin,
      zonaId,
      unidadId,
      patrullajeId,
      usuarioId,
      tipoIncidencia,
      estadoIncidencia,
      prioridadNormalizada,
      tipoAlerta,
      estadoAlerta,
      nivelCriticidad,
      incluirSinEventos,
      incluirPuntos,
      limiteNormalizado,
    }),
  };
};


module.exports = reporteZonasCriticasService;