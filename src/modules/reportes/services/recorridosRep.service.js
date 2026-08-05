const { Op, fn, col, } = require("sequelize");
const db = require("../../../database/models");

// Utils
const {
  buildEmptyResponse,
  buildFiltersResponse,
  createServiceError,
  groupByPatrullaje,
  normalizarSereno,
  normalizeDateOnly,
  parseNonNegativeNumber,
  parseNullableBoolean,
  parsePositiveInteger,
  roundNumber,
} = require("../utils/recorridos/recorrido.utils");

const {
  buildPorFecha,
  buildPorSereno,
  buildPorUnidad,
  buildPorZona,
} = require("../utils/recorridos/build_data.utils");

const {
  calcularMetricasRecorrido,
  calculateDistanceBetweenPoints,
  degreesToRadians,
  normalizarPuntosGps,
} = require("../utils/recorridos/metricas_recorrido.utils");

const ESTADOS_PATRULLAJE = [
  "PROGRAMADO",
  "ASIGNADO",
  "ACEPTADO",
  "EN_CURSO",
  "FINALIZADO",
];

const TIPOS_GPS = [
  "TRACKING",
  "EMERGENCIA",
  "MANUAL",
];

/**
 * Reporte consolidado de recorridos.
 *
 * Filtros soportados:
 * - page
 * - limit
 * - fecha_inicio
 * - fecha_fin
 * - patrullaje_id
 * - zona_id
 * - unidad_id
 * - usuario_id
 * - estado_patrullaje
 * - tipo_gps
 * - precision_maxima
 * - con_recorrido
 */
const reporteRecorridosService = async ({
  page = 1,
  limit = 10,

  fecha_inicio,
  fecha_fin,

  patrullaje_id,
  zona_id,
  unidad_id,
  usuario_id,

  estado_patrullaje,
  tipo_gps,

  precision_maxima,
  con_recorrido,
} = {}) => {

  // =========================================================
  // 1. PAGINACIÓN
  // =========================================================
  const pageNumber = Math.max(
    Number.parseInt(page, 10) || 1,
    1,
  );

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
  // 2. NORMALIZAR FILTROS
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
    ? String(estado_patrullaje)
      .trim()
      .toUpperCase()
    : null;

  const tipoGps = tipo_gps
    ? String(tipo_gps)
      .trim()
      .toUpperCase()
    : null;

  if (
    estadoPatrullaje &&
    !ESTADOS_PATRULLAJE.includes(
      estadoPatrullaje,
    )
  ) {
    throw createServiceError(
      `estado_patrullaje no válido. Valores permitidos: ${ESTADOS_PATRULLAJE.join(", ")}.`,
      400,
    );
  }

  if (
    tipoGps &&
    !TIPOS_GPS.includes(tipoGps)
  ) {
    throw createServiceError(
      `tipo_gps no válido. Valores permitidos: ${TIPOS_GPS.join(", ")}.`,
      400,
    );
  }

  const precisionMaxima =
    precision_maxima !== undefined &&
      precision_maxima !== null &&
      precision_maxima !== ""
      ? parseNonNegativeNumber(
        precision_maxima,
        "precision_maxima",
      )
      : null;

  const conRecorrido =
    parseNullableBoolean(
      con_recorrido,
      "con_recorrido",
    );

  const fechaInicio =
    normalizeDateOnly(
      fecha_inicio,
      "fecha_inicio",
    );

  const fechaFin =
    normalizeDateOnly(
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

  // =========================================================
  // 3. WHERE DE PATRULLAJE
  // =========================================================

  const patrullajeWhere = {};

  if (patrullajeId) {
    patrullajeWhere.id = patrullajeId;
  }

  if (zonaId) {
    patrullajeWhere.zona_id = zonaId;
  }

  if (unidadId) {
    patrullajeWhere.unidad_id = unidadId;
  }

  if (estadoPatrullaje) {
    patrullajeWhere.estado =
      estadoPatrullaje;
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

  // =========================================================
  // 4. FILTRO POR SERENO
  // =========================================================

  const personalFilterInclude =
    usuarioId
      ? [
        {
          model:
            db.PatrullajePersonal,

          as: "personal",

          attributes: [],

          required: true,

          where: {
            usuario_id:
              usuarioId,

            tipo_personal:
              "SERENO",
          },
        },
      ]
      : [];

  // =========================================================
  // 5. OBTENER PATRULLAJES BASE
  // =========================================================

  const patrullajesBase =
    await db.PatrullajeProgramado.findAll({
      where:
        patrullajeWhere,

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

      include:
        personalFilterInclude,

      order: [
        ["fecha", "DESC"],
        ["hora_inicio", "DESC"],
        ["id", "DESC"],
      ],

      distinct: true,
    });

  const patrullajeIds =
    patrullajesBase.map(
      patrullaje =>
        Number(patrullaje.id),
    );

  if (
    patrullajeIds.length === 0
  ) {
    return buildEmptyResponse({
      pageNumber,
      limitNumber,
      filters: buildFiltersResponse({
        fechaInicio,
        fechaFin,
        patrullajeId,
        zonaId,
        unidadId,
        usuarioId,
        estadoPatrullaje,
        tipoGps,
        precisionMaxima,
        conRecorrido,
      }),
    });
  }

  // =========================================================
  // 6. WHERE DE PUNTOS GPS
  // =========================================================

  const gpsWhere = {
    patrullaje_id: {
      [Op.in]:
        patrullajeIds,
    },
  };

  if (tipoGps) {
    gpsWhere.tipo = tipoGps;
  }

  if (precisionMaxima !== null) {
    /*
     * También se aceptan puntos sin precisión registrada.
     * Puedes eliminar Op.is null si deseas descartarlos.
     */
    gpsWhere[Op.or] = [
      {
        precision: {
          [Op.lte]:
            precisionMaxima,
        },
      },
      {
        precision: {
          [Op.is]: null,
        },
      },
    ];
  }

  // =========================================================
  // 7. CONSULTAS RELACIONADAS
  // =========================================================

  const [
    puntosGps,
    resumenes,
    personal,
    patrullajesCompletos,
  ] = await Promise.all([

    // Puntos GPS
    db.PatrullajeGps.findAll({
      where:
        gpsWhere,

      attributes: [
        "id",
        "patrullaje_id",
        "usuario_id",
        "latitud",
        "longitud",
        "velocidad",
        "precision",
        "fecha_hora",
        "tipo",
        "createdAt",
        "updatedAt",
      ],

      order: [
        ["patrullaje_id", "ASC"],
        ["fecha_hora", "ASC"],
        ["id", "ASC"],
      ],
    }),

    // Resumen oficial del patrullaje
    db.PatrullajeResumen.findAll({
      where: {
        patrullaje_id: {
          [Op.in]:
            patrullajeIds,
        },
      },

      attributes: [
        "id",
        "patrullaje_id",
        "usuario_finaliza_id",
        "fecha_inicio",
        "fecha_fin",
        "duracion_segundos",
        "distancia_total_metros",
        "total_puntos_recorrido",
        "total_incidencias",
        "total_observaciones",
        "observacion_final",
        "createdAt",
        "updatedAt",
      ],
    }),

    // Personal del patrullaje
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

      order: [
        ["patrullaje_id", "ASC"],
        ["id", "ASC"],
      ],
    }),

    // Datos principales del patrullaje
    db.PatrullajeProgramado.findAll({
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
    }),
  ]);

  // =========================================================
  // 8. ORGANIZAR DATOS POR PATRULLAJE
  // =========================================================

  const puntosMap =
    groupByPatrullaje(
      puntosGps,
    );

  const personalMap =
    groupByPatrullaje(
      personal,
    );

  const resumenMap =
    new Map(
      resumenes.map(
        resumen => [
          Number(
            resumen.patrullaje_id,
          ),
          resumen,
        ],
      ),
    );

  // =========================================================
  // 9. CONSTRUIR DETALLE DE RECORRIDOS
  // =========================================================

  let detalleCompleto =
    patrullajesCompletos.map(
      patrullaje => {

        const id =
          Number(patrullaje.id);

        const puntosOriginales =
          puntosMap.get(id) ?? [];

        const puntosValidos =
          normalizarPuntosGps(
            puntosOriginales,
          );

        const metricasCalculadas =
          calcularMetricasRecorrido(
            puntosValidos,
          );

        const resumen =
          resumenMap.get(id) ??
          null;

        const asignaciones =
          personalMap.get(id) ??
          [];

        const serenos =
          asignaciones
            .filter(
              asignacion =>
                asignacion.tipo_personal ===
                "SERENO" &&
                asignacion.usuario_id,
            )
            .map(
              asignacion =>
                normalizarSereno(
                  asignacion,
                ),
            );

        const recorrido =
          puntosValidos.map(
            punto => ({
              id:
                punto.id,

              patrullaje_id:
                Number(
                  punto.patrullaje_id,
                ),

              usuario_id:
                Number(
                  punto.usuario_id,
                ),

              latitud:
                Number(
                  punto.latitud,
                ),

              longitud:
                Number(
                  punto.longitud,
                ),

              velocidad:
                punto.velocidad !==
                  null
                  ? Number(
                    punto.velocidad,
                  )
                  : null,

              precision:
                punto.precision !==
                  null
                  ? Number(
                    punto.precision,
                  )
                  : null,

              fecha_hora:
                punto.fecha_hora,

              tipo:
                punto.tipo,
            }),
          );

        /*
         * Para recorridos finalizados se considera el resumen
         * como fuente oficial de distancia y duración.
         *
         * Si no existe resumen, se usan los valores calculados
         * directamente desde los puntos GPS.
         */
        const usarResumenOficial =
          patrullaje.estado ===
          "FINALIZADO" &&
          resumen !== null;

        const distanciaMetros =
          usarResumenOficial
            ? Number(
              resumen
                .distancia_total_metros ??
              0,
            )
            : metricasCalculadas
              .distancia_metros;

        const duracionSegundos =
          usarResumenOficial
            ? Number(
              resumen
                .duracion_segundos ??
              0,
            )
            : metricasCalculadas
              .duracion_segundos;

        return {
          patrullaje_id:
            id,

          fecha:
            patrullaje.fecha,

          hora_inicio:
            patrullaje.hora_inicio,

          hora_fin:
            patrullaje.hora_fin,

          estado:
            patrullaje.estado,

          descripcion:
            patrullaje.descripcion,

          zona:
            patrullaje.zona,

          unidad:
            patrullaje.unidad,

          serenos,

          metricas: {
            puntos_gps:
              metricasCalculadas
                .puntos_gps,

            distancia_metros:
              roundNumber(
                distanciaMetros,
                2,
              ),

            distancia_km:
              roundNumber(
                distanciaMetros /
                1000,
                2,
              ),

            duracion_segundos:
              duracionSegundos,

            duracion_horas:
              roundNumber(
                duracionSegundos /
                3600,
                2,
              ),

            velocidad_promedio:
              metricasCalculadas
                .velocidad_promedio,

            velocidad_maxima:
              metricasCalculadas
                .velocidad_maxima,

            precision_promedio:
              metricasCalculadas
                .precision_promedio,

            primer_reporte:
              metricasCalculadas
                .primer_reporte,

            ultimo_reporte:
              metricasCalculadas
                .ultimo_reporte,

            puntos_tracking:
              metricasCalculadas
                .puntos_tracking,

            puntos_emergencia:
              metricasCalculadas
                .puntos_emergencia,

            puntos_manuales:
              metricasCalculadas
                .puntos_manuales,
          },

          inicio:
            recorrido.length > 0
              ? recorrido[0]
              : null,

          fin:
            recorrido.length > 0
              ? recorrido[
              recorrido.length - 1
              ]
              : null,

          resumen_oficial:
            resumen
              ? {
                id:
                  resumen.id,

                fecha_inicio:
                  resumen.fecha_inicio,

                fecha_fin:
                  resumen.fecha_fin,

                duracion_segundos:
                  Number(
                    resumen
                      .duracion_segundos ??
                    0,
                  ),

                distancia_total_metros:
                  Number(
                    resumen
                      .distancia_total_metros ??
                    0,
                  ),

                total_puntos_recorrido:
                  Number(
                    resumen
                      .total_puntos_recorrido ??
                    0,
                  ),

                observacion_final:
                  resumen
                    .observacion_final ??
                  null,
              }
              : null,

          recorrido,

          createdAt:
            patrullaje.createdAt,

          updatedAt:
            patrullaje.updatedAt,
        };
      },
    );

  // =========================================================
  // 10. FILTRAR POR PRESENCIA DE RECORRIDO
  // =========================================================

  if (conRecorrido !== null) {
    detalleCompleto =
      detalleCompleto.filter(
        item =>
          conRecorrido
            ? item.metricas
              .puntos_gps > 0
            : item.metricas
              .puntos_gps === 0,
      );
  }

  // =========================================================
  // 11. RESUMEN GENERAL
  // =========================================================

  const resumenGeneral =
    detalleCompleto.reduce(
      (
        acumulado,
        recorrido,
      ) => {

        acumulado.total_recorridos +=
          1;

        if (
          recorrido.estado ===
          "FINALIZADO"
        ) {
          acumulado.recorridos_finalizados +=
            1;
        }

        if (
          recorrido.estado ===
          "EN_CURSO"
        ) {
          acumulado.recorridos_en_curso +=
            1;
        }

        if (
          recorrido.metricas
            .puntos_gps > 0
        ) {
          acumulado.recorridos_con_gps +=
            1;
        } else {
          acumulado.recorridos_sin_gps +=
            1;
        }

        acumulado.total_puntos_gps +=
          recorrido.metricas
            .puntos_gps;

        acumulado.distancia_total_metros +=
          recorrido.metricas
            .distancia_metros;

        acumulado.duracion_total_segundos +=
          recorrido.metricas
            .duracion_segundos;

        acumulado.puntos_emergencia +=
          recorrido.metricas
            .puntos_emergencia;

        acumulado.puntos_manuales +=
          recorrido.metricas
            .puntos_manuales;

        if (
          recorrido.metricas
            .velocidad_maxima !==
          null
        ) {
          acumulado.velocidad_maxima =
            acumulado.velocidad_maxima ===
              null
              ? recorrido.metricas
                .velocidad_maxima
              : Math.max(
                acumulado.velocidad_maxima,
                recorrido.metricas
                  .velocidad_maxima,
              );
        }

        return acumulado;
      },
      {
        total_recorridos: 0,

        recorridos_finalizados: 0,
        recorridos_en_curso: 0,

        recorridos_con_gps: 0,
        recorridos_sin_gps: 0,

        total_puntos_gps: 0,

        distancia_total_metros: 0,
        distancia_total_km: 0,

        duracion_total_segundos: 0,
        horas_totales: 0,

        velocidad_maxima: null,

        puntos_emergencia: 0,
        puntos_manuales: 0,
      },
    );

  resumenGeneral.distancia_total_metros =
    roundNumber(
      resumenGeneral
        .distancia_total_metros,
      2,
    );

  resumenGeneral.distancia_total_km =
    roundNumber(
      resumenGeneral
        .distancia_total_metros /
      1000,
      2,
    );

  resumenGeneral.horas_totales =
    roundNumber(
      resumenGeneral
        .duracion_total_segundos /
      3600,
      2,
    );

  // =========================================================
  // 12. AGRUPACIONES
  // =========================================================

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

  const porSereno =
    buildPorSereno(
      detalleCompleto,
    );

  // =========================================================
  // 13. PAGINAR
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
    resumen:
      resumenGeneral,

    por_unidad:
      porUnidad,

    por_zona:
      porZona,

    por_fecha:
      porFecha,

    por_sereno:
      porSereno,

    detalle: {
      data:
        detallePaginado,

      pagination: {
        page:
          pageNumber,

        limit:
          limitNumber,

        totalItems,

        totalPages,

        hasNextPage:
          pageNumber <
          totalPages,

        hasPreviousPage:
          pageNumber > 1,
      },
    },

    filters:
      buildFiltersResponse({
        fechaInicio,
        fechaFin,
        patrullajeId,
        zonaId,
        unidadId,
        usuarioId,
        estadoPatrullaje,
        tipoGps,
        precisionMaxima,
        conRecorrido,
      }),
  };
};


module.exports = reporteRecorridosService;