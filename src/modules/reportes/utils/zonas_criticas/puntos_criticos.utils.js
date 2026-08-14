const { hasValidCoordinates, formatDateOnly } = require("./zonas_criticas.utils");

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
// PUNTAJES
// =========================================================
const calcularPuntajeIncidencias = incidencias => {

  return incidencias.reduce(
    (total, incidencia) => {

      const puntajeEstado =
        PUNTAJE_ESTADO_INCIDENCIA[
        incidencia.estado
        ] ?? 0;

      return (
        total +
        PUNTAJE_INCIDENCIA_BASE +
        puntajeEstado
      );
    },
    0,
  );
};

const calcularPuntajeHistoriales = historiales => {

  return historiales.reduce(
    (total, historial) => {

      const puntajePrioridad =
        PUNTAJE_PRIORIDAD_HISTORIAL[
        historial.prioridad
        ] ?? 0;

      const puntajeTipo =
        PUNTAJE_TIPO_HISTORIAL[
        historial.tipo
        ] ?? 0;

      return (
        total +
        puntajePrioridad +
        puntajeTipo
      );
    },
    0,
  );
};

const calcularPuntajeAlertas = alertas => {

  return alertas.reduce(
    (total, alerta) => {

      const puntajePrioridad =
        PUNTAJE_PRIORIDAD_ALERTA[
        alerta.prioridad
        ] ?? 0;

      const adicionalEmergencia =
        TIPOS_ALERTA_EMERGENCIA
          .includes(alerta.tipo)
          ? 2
          : 0;

      return (
        total +
        puntajePrioridad +
        adicionalEmergencia
      );
    },
    0,
  );
};

const calcularNivelCriticidad = puntaje => {

  if (puntaje >= 20) {
    return "CRITICO";
  }

  if (puntaje >= 10) {
    return "ALTO";
  }

  if (puntaje >= 5) {
    return "MEDIO";
  }

  return "BAJO";
};

// =========================================================
// PUNTOS GEOGRÁFICOS
// =========================================================
const buildPuntosGeograficos = ({
  incidencias,
  historiales,
  alertas,
}) => {

  const puntosIncidencias =
    incidencias
      .filter(hasValidCoordinates)
      .map(item => ({
        fuente: "INCIDENCIA",
        id: item.id,

        tipo: item.tipo,
        estado: item.estado,
        prioridad: null,

        titulo:
          `Incidencia ${item.tipo}`,

        descripcion:
          item.descripcion,

        latitud:
          Number(item.latitud),

        longitud:
          Number(item.longitud),

        fecha_hora:
          item.fecha_hora,

        puntaje:
          PUNTAJE_INCIDENCIA_BASE +
          (
            PUNTAJE_ESTADO_INCIDENCIA[
            item.estado
            ] ?? 0
          ),
      }));

  const puntosHistorial =
    historiales
      .filter(hasValidCoordinates)
      .map(item => ({
        fuente: "HISTORIAL",
        id: item.id,

        tipo: item.tipo,
        estado: item.estado,
        prioridad: item.prioridad,

        titulo: item.titulo,
        descripcion:
          item.descripcion,

        latitud:
          Number(item.latitud),

        longitud:
          Number(item.longitud),

        fecha_hora:
          item.fecha_hora,

        puntaje:
          (
            PUNTAJE_PRIORIDAD_HISTORIAL[
            item.prioridad
            ] ?? 0
          ) +
          (
            PUNTAJE_TIPO_HISTORIAL[
            item.tipo
            ] ?? 0
          ),
      }));

  const puntosAlertas =
    alertas
      .filter(hasValidCoordinates)
      .map(item => ({
        fuente: "ALERTA",
        id: item.id,

        tipo: item.tipo,
        estado: item.estado,
        prioridad: item.prioridad,

        titulo: item.titulo,
        descripcion:
          item.descripcion,

        latitud:
          Number(item.latitud),

        longitud:
          Number(item.longitud),

        fecha_hora:
          item.createdAt,

        puntaje:
          (
            PUNTAJE_PRIORIDAD_ALERTA[
            item.prioridad
            ] ?? 0
          ) +
          (
            TIPOS_ALERTA_EMERGENCIA
              .includes(item.tipo)
              ? 2
              : 0
          ),
      }));

  return [
    ...puntosIncidencias,
    ...puntosHistorial,
    ...puntosAlertas,
  ].sort(
    (a, b) =>
      new Date(b.fecha_hora).getTime() -
      new Date(a.fecha_hora).getTime(),
  );
};

// =========================================================
// DISTRIBUCIÓN POR FECHA
// =========================================================
const buildPorFecha = ({
  incidencias,
  historiales,
  alertas,
}) => {

  const map = new Map();

  const ensureDate = fecha => {

    if (!map.has(fecha)) {
      map.set(fecha, {
        fecha,

        incidencias: 0,
        historiales: 0,
        alertas: 0,

        total_eventos: 0,
      });
    }

    return map.get(fecha);
  };

  for (const incidencia of incidencias) {
    const fecha = formatDateOnly(
      incidencia.fecha_hora,
    );

    const item = ensureDate(fecha);

    item.incidencias += 1;
    item.total_eventos += 1;
  }

  for (const historial of historiales) {
    const fecha = formatDateOnly(
      historial.fecha_hora,
    );

    const item = ensureDate(fecha);

    item.historiales += 1;
    item.total_eventos += 1;
  }

  for (const alerta of alertas) {
    const fecha = formatDateOnly(
      alerta.createdAt,
    );

    const item = ensureDate(fecha);

    item.alertas += 1;
    item.total_eventos += 1;
  }

  return Array.from(map.values())
    .sort(
      (a, b) =>
        a.fecha.localeCompare(
          b.fecha,
        ),
    );
};


module.exports = {
  buildPorFecha,
  buildPuntosGeograficos,
  calcularNivelCriticidad,
  calcularPuntajeAlertas,
  calcularPuntajeHistoriales,
  calcularPuntajeIncidencias,
}