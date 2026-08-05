// =========================================================
// UTILIDADES
// =========================================================

// - parsePositiveInteger
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

// - parseBoolean
const parseBoolean = (value, fieldName,) => {

  if (typeof value === "boolean") {
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

/**
 * Para fechas YYYY-MM-DD se usa UTC-5,
 * correspondiente a la hora de Perú.
 */
const normalizeStartDate = value => {

  if (!value) {
    return null;
  }

  const stringValue =
    String(value).trim();

  const date =
    /^\d{4}-\d{2}-\d{2}$/.test(
      stringValue,
    )
      ? new Date(
        `${stringValue}T00:00:00.000-05:00`,
      )
      : new Date(stringValue);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    throw createServiceError(
      "fecha_inicio no contiene una fecha válida.",
      400,
    );
  }

  return date;
};

const normalizeEndDate = value => {

  if (!value) {
    return null;
  }

  const stringValue =
    String(value).trim();

  const date =
    /^\d{4}-\d{2}-\d{2}$/.test(
      stringValue,
    )
      ? new Date(
        `${stringValue}T23:59:59.999-05:00`,
      )
      : new Date(stringValue);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    throw createServiceError(
      "fecha_fin no contiene una fecha válida.",
      400,
    );
  }

  return date;
};

const createServiceError = (
  message,
  statusCode = 500,
) => {

  const error =
    new Error(message);

  error.statusCode =
    statusCode;

  return error;
};


module.exports = {
  createServiceError,
  normalizeEndDate,
  normalizeStartDate,
  parseBoolean,
  parsePositiveInteger,
};