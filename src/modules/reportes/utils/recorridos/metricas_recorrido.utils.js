const { roundNumber } = require("./recorrido.utils");

// =========================================================
// 1. MÉTRICAS DEL RECORRIDO
// =========================================================
const calcularMetricasRecorrido = (puntos,) => {

  if (puntos.length === 0) {
    return {
      puntos_gps: 0,
      distancia_metros: 0,
      duracion_segundos: 0,

      velocidad_promedio: null,
      velocidad_maxima: null,
      precision_promedio: null,

      primer_reporte: null,
      ultimo_reporte: null,

      puntos_tracking: 0,
      puntos_emergencia: 0,
      puntos_manuales: 0,
    };
  }

  let distanciaMetros = 0;

  for (
    let index = 1;
    index < puntos.length;
    index += 1
  ) {
    const anterior = puntos[index - 1];

    const actual = puntos[index];

    distanciaMetros += calculateDistanceBetweenPoints(
      Number(anterior.latitud),
      Number(anterior.longitud),
      Number(actual.latitud),
      Number(actual.longitud),
    );
  }

  const primerReporte = new Date(puntos[0].fecha_hora,);

  const ultimoReporte = new Date(
    puntos[
      puntos.length - 1
    ].fecha_hora,
  );

  const duracionSegundos = Math.max(
    Math.floor(
      (
        ultimoReporte.getTime() -
        primerReporte.getTime()
      ) / 1000,
    ),
    0,
  );

  const velocidades = puntos.map(
    punto =>
      punto.velocidad !== null
        ? Number(
          punto.velocidad,
        )
        : null,
  )
    .filter(
      value =>
        value !== null &&
        Number.isFinite(value),
    );

  const precisiones = puntos.map(
    punto =>
      punto.precision !== null
        ? Number(
          punto.precision,
        )
        : null,
  )
    .filter(
      value =>
        value !== null &&
        Number.isFinite(value),
    );

  return {
    puntos_gps: puntos.length,

    distancia_metros: roundNumber(distanciaMetros, 2,),

    duracion_segundos: duracionSegundos,

    velocidad_promedio: velocidades.length > 0
      ? roundNumber(
        velocidades.reduce(
          (total, value) =>
            total + value,
          0,
        ) /
        velocidades.length,
        2,
      )
      : null,

    velocidad_maxima: velocidades.length > 0
      ? roundNumber(
        Math.max(
          ...velocidades,
        ),
        2,
      )
      : null,

    precision_promedio: precisiones.length > 0
      ? roundNumber(
        precisiones.reduce(
          (total, value) =>
            total + value,
          0,
        ) /
        precisiones.length,
        2,
      )
      : null,

    primer_reporte: puntos[0].fecha_hora,
    ultimo_reporte: puntos[puntos.length - 1].fecha_hora,

    puntos_tracking:
      puntos.filter(
        punto =>
          punto.tipo ===
          "TRACKING",
      ).length,

    puntos_emergencia:
      puntos.filter(
        punto =>
          punto.tipo ===
          "EMERGENCIA",
      ).length,

    puntos_manuales:
      puntos.filter(
        punto =>
          punto.tipo ===
          "MANUAL",
      ).length,
  };
};


// =========================================================
// 2. DISTANCIA HAVERSINE
// =========================================================

/**
 * Retorna la distancia en metros.
 */
const calculateDistanceBetweenPoints = (
  lat1,
  lon1,
  lat2,
  lon2,
) => {

  const earthRadiusMeters =
    6371000;

  const lat1Radians =
    degreesToRadians(lat1);

  const lat2Radians =
    degreesToRadians(lat2);

  const deltaLat =
    degreesToRadians(
      lat2 - lat1,
    );

  const deltaLon =
    degreesToRadians(
      lon2 - lon1,
    );

  const a =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(lat1Radians) *
    Math.cos(lat2Radians) *
    Math.sin(deltaLon / 2) ** 2;

  const c =
    2 *
    Math.atan2(
      Math.sqrt(a),
      Math.sqrt(1 - a),
    );

  return earthRadiusMeters * c;
};

const degreesToRadians = degrees =>
  degrees * (Math.PI / 180);

// =========================================================
// VALIDACIÓN DE PUNTOS GPS
// =========================================================
const normalizarPuntosGps = (
  puntos,
) => {

  return puntos.filter(
    punto => {

      const latitud =
        Number(
          punto.latitud,
        );

      const longitud =
        Number(
          punto.longitud,
        );

      return (
        Number.isFinite(
          latitud,
        ) &&
        Number.isFinite(
          longitud,
        ) &&
        latitud >= -90 &&
        latitud <= 90 &&
        longitud >= -180 &&
        longitud <= 180
      );
    },
  );
};


module.exports = {
  calcularMetricasRecorrido,
  calculateDistanceBetweenPoints,
  degreesToRadians,
  normalizarPuntosGps,
}