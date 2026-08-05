
// =========================================================
// UTILIDADES
// =========================================================
const createMapByPatrullaje = (items,) => {
  return new Map(
    items.map(item => [
      Number(
        item.patrullaje_id,
      ),
      item,
    ]),
  );
};

const createTotalMap = (items, totalField,) => {

  return new Map(
    items.map(item => [
      Number(
        item.patrullaje_id,
      ),

      Number(
        item[totalField] ??
        0,
      ),
    ]),
  );
};

const parsePositiveInteger = (value, fieldName,) => {

  const parsed =
    Number.parseInt(
      value,
      10,
    );

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

const parseNullableBoolean = (value, fieldName,) => {

  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return null;
  }

  if (
    typeof value ===
    "boolean"
  ) {
    return value;
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

const normalizeDateOnly = (value, fieldName,) => {

  if (!value) {
    return null;
  }

  const normalized =
    String(value).trim();

  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(
      normalized,
    )
  ) {
    throw createServiceError(
      `${fieldName} debe tener formato YYYY-MM-DD.`,
      400,
    );
  }

  const date =
    new Date(
      `${normalized}T00:00:00.000Z`,
    );

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

  return normalized;
};

const createServiceError = (message, statusCode = 500,) => {

  const error =
    new Error(message);

  error.statusCode =
    statusCode;

  return error;
};

const buildEmptyResponse = ({ pageNumber, limitNumber, filters, }) => ({
  resumen: {
    total_patrullajes: 0,

    programados: 0,
    asignados: 0,
    aceptados: 0,
    en_curso: 0,
    finalizados: 0,

    duracion_total_segundos: 0,
    horas_operativas: 0,

    distancia_total_metros: 0,
    distancia_total_km: 0,

    total_puntos_gps: 0,

    incidencias_registradas: 0,
    historiales_registrados: 0,
    alertas_generadas: 0,
  },

  por_sereno: [],
  por_unidad: [],
  por_zona: [],
  por_fecha: [],

  detalle: {
    data: [],

    pagination: {
      page:
        pageNumber,

      limit:
        limitNumber,

      totalItems: 0,
      totalPages: 0,

      hasNextPage: false,
      hasPreviousPage: false,
    },
  },

  filters,
});


module.exports = {
  buildEmptyResponse,
  createMapByPatrullaje,
  createServiceError,
  createTotalMap,
  normalizeDateOnly,
  parseNullableBoolean,
  parsePositiveInteger,
}