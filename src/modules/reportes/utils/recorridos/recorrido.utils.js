
// =========================================================
// UTILIDADES
// =========================================================
const groupByPatrullaje = (
  items,
) => {

  const map = new Map();

  for (const item of items) {
    const patrullajeId =
      Number(
        item.patrullaje_id,
      );

    if (!map.has(patrullajeId)) {
      map.set(
        patrullajeId,
        [],
      );
    }

    map
      .get(patrullajeId)
      .push(item);
  }

  return map;
};

const normalizarSereno = (
  asignacion,
) => {

  const usuario =
    asignacion.usuario;

  const persona =
    usuario?.persona;

  return {
    asignacion_id:
      asignacion.id,

    usuario_id:
      Number(
        asignacion.usuario_id,
      ),

    username:
      usuario?.username ?? null,

    nombre:
      persona
        ? `${persona.nombres} ${persona.apellidos}`
          .trim()
        : usuario?.username ??
        `Usuario #${asignacion.usuario_id}`,

    documento:
      persona
        ?.documento_identidad ??
      null,

    telefono:
      persona?.telefono ?? null,

    foto_perfil:
      persona?.foto_perfil ?? null,

    estado_asignacion:
      asignacion.estado,

    fecha_asignacion:
      asignacion.fecha_asignacion,
  };
};

const parsePositiveInteger = (
  value,
  fieldName,
) => {

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

const parseNonNegativeNumber = (
  value,
  fieldName,
) => {

  const parsed =
    Number(value);

  if (
    !Number.isFinite(parsed) ||
    parsed < 0
  ) {
    throw createServiceError(
      `${fieldName} debe ser un número mayor o igual a cero.`,
      400,
    );
  }

  return parsed;
};

const parseNullableBoolean = (
  value,
  fieldName,
) => {

  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return null;
  }

  if (
    typeof value === "boolean"
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

const normalizeDateOnly = (
  value,
  fieldName,
) => {

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

const roundNumber = (
  value,
  decimals = 2,
) => {

  const factor =
    10 ** decimals;

  return Math.round(
    (
      Number(value) +
      Number.EPSILON
    ) * factor,
  ) / factor;
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

const buildFiltersResponse = ({
  fechaInicio,
  fechaFin,
  patrullajeId,
  zonaId,
  unidadId,
  usuarioId,
  estadoPatrullaje,
  tipoGps,
  precisionMaxima,
  conRecorrido, }) => ({
    fecha_inicio: fechaInicio,
    fecha_fin: fechaFin,
    patrullaje_id: patrullajeId,
    zona_id: zonaId,
    unidad_id: unidadId,
    usuario_id: usuarioId,
    estado_patrullaje: estadoPatrullaje,
    tipo_gps: tipoGps,
    precision_maxima: precisionMaxima,
    con_recorrido: conRecorrido,
  });

const buildEmptyResponse = ({ pageNumber, limitNumber, filters, }) => ({
  resumen: {
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

  por_unidad: [],
  por_zona: [],
  por_fecha: [],
  por_sereno: [],

  detalle: {
    data: [],

    pagination: {
      page: pageNumber,
      limit: limitNumber,
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
  buildFiltersResponse,
  createServiceError,
  groupByPatrullaje,
  normalizarSereno,
  normalizeDateOnly,
  parseNonNegativeNumber,
  parseNullableBoolean,
  parsePositiveInteger,
  roundNumber,
}