const { roundNumber } = require("./recorrido.utils");

// =========================================================
// AGRUPACIONES
// =========================================================
const buildPorUnidad = (
  recorridos,
) => {

  const map = new Map();

  for (
    const recorrido
    of recorridos
  ) {
    const unidad =
      recorrido.unidad;

    const key =
      unidad?.id ??
      "SIN_UNIDAD";

    if (!map.has(key)) {
      map.set(key, {
        unidad_id:
          unidad?.id ?? null,

        codigo:
          unidad?.codigo ??
          "Sin unidad",

        placa:
          unidad?.placa ?? null,

        tipo:
          unidad?.tipo ?? null,

        recorridos: 0,
        puntos_gps: 0,

        distancia_metros: 0,
        distancia_km: 0,

        duracion_segundos: 0,
        horas_recorrido: 0,
      });
    }

    const item =
      map.get(key);

    item.recorridos += 1;

    item.puntos_gps +=
      recorrido.metricas
        .puntos_gps;

    item.distancia_metros +=
      recorrido.metricas
        .distancia_metros;

    item.duracion_segundos +=
      recorrido.metricas
        .duracion_segundos;
  }

  return Array.from(
    map.values(),
  )
    .map(item => ({
      ...item,

      distancia_metros:
        roundNumber(
          item.distancia_metros,
          2,
        ),

      distancia_km:
        roundNumber(
          item.distancia_metros /
          1000,
          2,
        ),

      horas_recorrido:
        roundNumber(
          item.duracion_segundos /
          3600,
          2,
        ),
    }))
    .sort(
      (a, b) =>
        b.distancia_metros -
        a.distancia_metros,
    );
};

const buildPorZona = (
  recorridos,
) => {

  const map = new Map();

  for (
    const recorrido
    of recorridos
  ) {
    const zona =
      recorrido.zona;

    const key =
      zona?.id ??
      `ZONA_${recorrido.patrullaje_id}`;

    if (!map.has(key)) {
      map.set(key, {
        zona_id:
          zona?.id ?? null,

        zona:
          zona?.nombre ??
          "Sin zona",

        riesgo:
          zona?.riesgo ?? null,

        recorridos: 0,
        puntos_gps: 0,

        distancia_metros: 0,
        distancia_km: 0,

        duracion_segundos: 0,
        horas_recorrido: 0,
      });
    }

    const item =
      map.get(key);

    item.recorridos += 1;

    item.puntos_gps +=
      recorrido.metricas
        .puntos_gps;

    item.distancia_metros +=
      recorrido.metricas
        .distancia_metros;

    item.duracion_segundos +=
      recorrido.metricas
        .duracion_segundos;
  }

  return Array.from(
    map.values(),
  )
    .map(item => ({
      ...item,

      distancia_metros:
        roundNumber(
          item.distancia_metros,
          2,
        ),

      distancia_km:
        roundNumber(
          item.distancia_metros /
          1000,
          2,
        ),

      horas_recorrido:
        roundNumber(
          item.duracion_segundos /
          3600,
          2,
        ),
    }))
    .sort(
      (a, b) =>
        b.distancia_metros -
        a.distancia_metros,
    );
};

const buildPorFecha = (recorridos,) => {

  const map = new Map();

  for (
    const recorrido
    of recorridos
  ) {
    const fecha =
      recorrido.fecha;

    if (!map.has(fecha)) {
      map.set(fecha, {
        fecha,

        recorridos: 0,
        puntos_gps: 0,

        distancia_metros: 0,
        distancia_km: 0,

        duracion_segundos: 0,
        horas_recorrido: 0,
      });
    }

    const item =
      map.get(fecha);

    item.recorridos += 1;

    item.puntos_gps +=
      recorrido.metricas
        .puntos_gps;

    item.distancia_metros +=
      recorrido.metricas
        .distancia_metros;

    item.duracion_segundos +=
      recorrido.metricas
        .duracion_segundos;
  }

  return Array.from(
    map.values(),
  )
    .map(item => ({
      ...item,

      distancia_metros:
        roundNumber(
          item.distancia_metros,
          2,
        ),

      distancia_km:
        roundNumber(
          item.distancia_metros /
          1000,
          2,
        ),

      horas_recorrido:
        roundNumber(
          item.duracion_segundos /
          3600,
          2,
        ),
    }))
    .sort(
      (a, b) =>
        a.fecha.localeCompare(
          b.fecha,
        ),
    );
};

const buildPorSereno = (recorridos,) => {

  const map = new Map();

  for (
    const recorrido
    of recorridos
  ) {
    for (
      const sereno
      of recorrido.serenos
    ) {
      const usuarioId =
        sereno.usuario_id;

      if (!map.has(usuarioId)) {
        map.set(usuarioId, {
          usuario_id:
            usuarioId,

          username:
            sereno.username,

          nombre:
            sereno.nombre,

          documento:
            sereno.documento,

          recorridos: 0,
          puntos_gps: 0,

          distancia_metros: 0,
          distancia_km: 0,

          duracion_segundos: 0,
          horas_recorrido: 0,
        });
      }

      const item =
        map.get(usuarioId);

      item.recorridos += 1;

      item.puntos_gps +=
        recorrido.metricas
          .puntos_gps;

      item.distancia_metros +=
        recorrido.metricas
          .distancia_metros;

      item.duracion_segundos +=
        recorrido.metricas
          .duracion_segundos;
    }
  }

  return Array.from(
    map.values(),
  )
    .map(item => ({
      ...item,

      distancia_metros:
        roundNumber(
          item.distancia_metros,
          2,
        ),

      distancia_km:
        roundNumber(
          item.distancia_metros /
          1000,
          2,
        ),

      horas_recorrido:
        roundNumber(
          item.duracion_segundos /
          3600,
          2,
        ),
    }))
    .sort(
      (a, b) =>
        b.distancia_metros -
        a.distancia_metros,
    );
};


module.exports = {
  buildPorFecha,
  buildPorSereno,
  buildPorUnidad,
  buildPorZona,
}
