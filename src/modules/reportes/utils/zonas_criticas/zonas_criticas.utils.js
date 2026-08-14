
// =========================================================
// PUNTAJES
// =========================================================

const PUNTAJE_INCIDENCIA_BASE = 1;

const PUNTAJE_ESTADO_INCIDENCIA = {
  REPORTADO: 1,
  EN_PROCESO: 1,
  ATENDIDO: 0,
  CERRADO: 0,
  ELIMINADO: 0,
};

const PUNTAJE_PRIORIDAD_HISTORIAL = {
  BAJA: 1,
  MEDIA: 1,
  ALTA: 2,
  CRITICA: 4,
};

const PUNTAJE_TIPO_HISTORIAL = {
  OBSERVACION: 0,
  NOVEDAD: 1,
  ALERTA: 2,
  RECOMENDACION: 0,
  PUNTO_CRITICO: 3,
  CAMBIO_TURNO: 0,
};

const PUNTAJE_PRIORIDAD_ALERTA = {
  BAJA: 1,
  MEDIA: 2,
  ALTA: 3,
  CRITICA: 5,
};

const TIPOS_ALERTA_EMERGENCIA = [
  "PANICO",
  "EMERGENCIA",
  "SOS",
];

// =========================================================
// UTILIDADES
// =========================================================
const groupByZona = items => {

  const map = new Map();

  for (const item of items) {

    if (!item.zona_id) {
      continue;
    }

    const zonaId = Number(
      item.zona_id,
    );

    if (!map.has(zonaId)) {
      map.set(zonaId, []);
    }

    map.get(zonaId).push(item);
  }

  return map;
};

const countByField = (
  items,
  field,
) => {

  const result = {};

  for (const item of items) {
    const value =
      item[field] ?? "SIN_VALOR";

    result[value] =
      (result[value] ?? 0) + 1;
  }

  return result;
};

const getPredominantValue = counts => {

  const entries =
    Object.entries(counts);

  if (entries.length === 0) {
    return null;
  }

  const [value, total] =
    entries.sort(
      (a, b) =>
        Number(b[1]) -
        Number(a[1]),
    )[0];

  return {
    valor: value,
    total: Number(total),
  };
};

const obtenerUltimaActividad = items => {

  const validDates = items
    .map(item =>
      new Date(item.fecha),
    )
    .filter(date =>
      !Number.isNaN(
        date.getTime(),
      ),
    );

  if (validDates.length === 0) {
    return null;
  }

  const latest = new Date(
    Math.max(
      ...validDates.map(
        date => date.getTime(),
      ),
    ),
  );

  return latest.toISOString();
};

const hasValidCoordinates = item => {

  if (
    item.latitud === null ||
    item.latitud === undefined ||
    item.longitud === null ||
    item.longitud === undefined
  ) {
    return false;
  }

  const latitud =
    Number(item.latitud);

  const longitud =
    Number(item.longitud);

  return (
    Number.isFinite(latitud) &&
    Number.isFinite(longitud) &&
    latitud >= -90 &&
    latitud <= 90 &&
    longitud >= -180 &&
    longitud <= 180
  );
};

const applyPatrullajeFilter = (
  where,
  patrullajeIds,
) => {

  if (patrullajeIds === null) {
    return;
  }

  where.patrullaje_id = {
    [Op.in]: patrullajeIds,
  };
};

const applyDateRange = (
  where,
  field,
  fechaInicio,
  fechaFin,
) => {

  if (fechaInicio && fechaFin) {
    where[field] = {
      [Op.between]: [
        fechaInicio,
        fechaFin,
      ],
    };

    return;
  }

  if (fechaInicio) {
    where[field] = {
      [Op.gte]: fechaInicio,
    };

    return;
  }

  if (fechaFin) {
    where[field] = {
      [Op.lte]: fechaFin,
    };
  }
};

const parsePositiveInteger = (
  value,
  fieldName,
) => {

  const parsed =
    Number.parseInt(value, 10);

  if (
    !Number.isFinite(parsed) ||
    parsed <= 0
  ) {
    throw createServiceError(
      `${fieldName} debe ser un entero positivo.`,
      400,
    );
  }

  return parsed;
};

const parseBoolean = (
  value,
  fieldName,
) => {

  if (typeof value === "boolean") {
    return value;
  }

  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return false;
  }

  const normalized =
    String(value)
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

  throw createServiceError(
    `${fieldName} debe ser true o false.`,
    400,
  );
};

const normalizeEnum = (
  value,
  allowedValues,
  fieldName,
) => {

  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return null;
  }

  const normalized =
    String(value)
      .trim()
      .toUpperCase();

  if (
    !allowedValues.includes(
      normalized,
    )
  ) {
    throw createServiceError(
      `${fieldName} no válido. Valores permitidos: ${allowedValues.join(", ")}.`,
      400,
    );
  }

  return normalized;
};

/**
 * Para una fecha YYYY-MM-DD se considera el inicio
 * del día en la zona horaria de Perú.
 */
const normalizeStartDate = (
  value,
  fieldName,
) => {

  if (!value) {
    return null;
  }

  const normalized =
    String(value).trim();

  const date =
    /^\d{4}-\d{2}-\d{2}$/.test(
      normalized,
    )
      ? new Date(
        `${normalized}T00:00:00.000-05:00`,
      )
      : new Date(normalized);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    throw createServiceError(
      `${fieldName} no contiene una fecha válida.`,
      400,
    );
  }

  return date;
};

const normalizeEndDate = (
  value,
  fieldName,
) => {

  if (!value) {
    return null;
  }

  const normalized =
    String(value).trim();

  const date =
    /^\d{4}-\d{2}-\d{2}$/.test(
      normalized,
    )
      ? new Date(
        `${normalized}T23:59:59.999-05:00`,
      )
      : new Date(normalized);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    throw createServiceError(
      `${fieldName} no contiene una fecha válida.`,
      400,
    );
  }

  return date;
};

const formatDateOnly = value => {

  const date = new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return "FECHA_INVALIDA";
  }

  return date
    .toISOString()
    .slice(0, 10);
};

const createServiceError = (message, statusCode = 500,) => {

  const error = new Error(message);

  error.statusCode =
    statusCode;

  return error;
};

const buildFiltersResponse = ({
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
}) => ({
  fecha_inicio: fechaInicio
    ? fechaInicio.toISOString()
    : null,

  fecha_fin: fechaFin
    ? fechaFin.toISOString()
    : null,

  zona_id: zonaId,
  unidad_id: unidadId,
  patrullaje_id: patrullajeId,
  usuario_id: usuarioId,
  tipo_incidencia: tipoIncidencia,
  estado_incidencia: estadoIncidencia,
  prioridad: prioridadNormalizada,
  tipo_alerta: tipoAlerta,
  estado_alerta: estadoAlerta,
  nivel_criticidad: nivelCriticidad,
  incluir_sin_eventos: incluirSinEventos,
  incluir_puntos: incluirPuntos,
  limite: limiteNormalizado,
});

const buildEmptyResponse = ({ filters, }) => ({
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

    zona_mas_critica: null,
  },

  ranking: [],
  por_fecha: [],

  filters,
});

module.exports = {
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
}
