// =========================================================
// 1. AGRUPACIÓN POR SERENO
// =========================================================
const buildPorSereno = (patrullajes,) => {
  const map = new Map();

  for (const patrullaje of patrullajes) {

    const serenos = patrullaje.personal.filter(item =>
      item.tipo_personal ===
      "SERENO" &&
      item.usuario_id,
    );

    for (const asignacion of serenos) {

      const usuarioId = Number(asignacion.usuario_id,);
      const usuario = asignacion.usuario;
      const persona = usuario?.persona;

      if (!map.has(usuarioId,)) {
        map.set(usuarioId, {
          usuario_id: usuarioId,
          username: usuario?.username ?? null,
          nombre: persona
            ? `${persona.nombres} ${persona.apellidos}`
              .trim()
            : usuario
              ?.username ??
            `Usuario #${usuarioId}`,

          documento: persona?.documento_identidad ?? null,
          patrullajes: 0,
          incidencias: 0,
          historiales: 0,
          alertas: 0,
          duracion_segundos: 0,
          horas_operativas: 0,
          distancia_metros: 0,
          distancia_km: 0,
        },
        );
      }

      const item = map.get(usuarioId,);
      item.patrullajes += 1;
      item.incidencias += patrullaje.actividad.incidencias;
      item.historiales += patrullaje.actividad.historiales;
      item.alertas += patrullaje.actividad.alertas;
      item.duracion_segundos += patrullaje.resumen.duracion_segundos;
      item.distancia_metros += patrullaje.resumen.distancia_total_metros;
    }
  }

  return Array.from(map.values(),).map(item => ({
    ...item,
    horas_operativas: Number((item.duracion_segundos / 3600).toFixed(2),),
    distancia_km: Number((item.distancia_metros / 1000).toFixed(2),),
  }))
    .sort(
      (a, b) =>
        b.patrullajes -
        a.patrullajes,
    );
};

// =========================================================
// 2. AGRUPACIÓN POR UNIDAD
// =========================================================
const buildPorUnidad = (patrullajes,) => {

  const map = new Map();

  for (const patrullaje of patrullajes) {

    const unidad = patrullaje.unidad;

    const key = unidad?.id ?? "SIN_UNIDAD";

    if (!map.has(key)) {
      map.set(key, {
        unidad_id: unidad?.id ?? null,
        codigo: unidad?.codigo ?? "Sin unidad",
        placa: unidad?.placa ?? null,
        tipo: unidad?.tipo ?? null,
        patrullajes: 0,
        finalizados: 0,
        incidencias: 0,
        duracion_segundos: 0,
        horas_operativas: 0,
        distancia_metros: 0,
        distancia_km: 0,
      });
    }

    const item = map.get(key);

    item.patrullajes += 1;

    if (patrullaje.estado === "FINALIZADO") {
      item.finalizados += 1;
    }

    item.incidencias += patrullaje.actividad.incidencias;
    item.duracion_segundos += patrullaje.resumen.duracion_segundos;
    item.distancia_metros += patrullaje.resumen.distancia_total_metros;
  }

  return Array.from(map.values(),)
    .map(item => ({
      ...item,
      horas_operativas: Number((item.duracion_segundos / 3600).toFixed(2),),
      distancia_km: Number((item.distancia_metros / 1000).toFixed(2),),
    }))
    .sort(
      (a, b) =>
        b.patrullajes -
        a.patrullajes,
    );
};

// =========================================================
// 3. AGRUPACIÓN POR ZONA
// =========================================================
const buildPorZona = (patrullajes,) => {

  const map = new Map();

  for (const patrullaje of patrullajes) {

    const zona = patrullaje.zona;
    const key = zona?.id ?? patrullaje.zona_id;

    if (!map.has(key)) {
      map.set(key, {
        zona_id: zona?.id ?? patrullaje.zona_id,
        zona: zona?.nombre ?? `Zona #${patrullaje.zona_id}`,
        riesgo: zona?.riesgo ?? null,
        patrullajes: 0,
        incidencias: 0,
        historiales: 0,
        alertas: 0,
        horas_operativas: 0,
        duracion_segundos: 0,
      });
    }

    const item = map.get(key);

    item.patrullajes += 1;
    item.incidencias += patrullaje.actividad.incidencias;
    item.historiales += patrullaje.actividad.historiales;
    item.alertas += patrullaje.actividad.alertas;
    item.duracion_segundos += patrullaje.resumen.duracion_segundos;
  }

  return Array.from(
    map.values(),
  )
    .map(item => ({
      ...item,
      horas_operativas: Number((item.duracion_segundos / 3600).toFixed(2),),
    }))
    .sort(
      (a, b) =>
        b.patrullajes -
        a.patrullajes,
    );
};

// =========================================================
// 4. AGRUPACIÓN POR FECHA
// =========================================================
const buildPorFecha = (patrullajes,) => {

  const map = new Map();

  for (const patrullaje of patrullajes) {

    const fecha = patrullaje.fecha;

    if (!map.has(fecha)) {
      map.set(fecha, {
        fecha,
        patrullajes: 0,
        finalizados: 0,
        incidencias: 0,
        historiales: 0,
        alertas: 0,
        horas_operativas: 0,
        duracion_segundos: 0,
      });
    }

    const item = map.get(fecha);

    item.patrullajes += 1;

    if (patrullaje.estado === "FINALIZADO") {
      item.finalizados += 1;
    }

    item.incidencias += patrullaje.actividad.incidencias;
    item.historiales += patrullaje.actividad.historiales;
    item.alertas += patrullaje.actividad.alertas;
    item.duracion_segundos += patrullaje.resumen.duracion_segundos;
  }

  return Array.from(map.values(),)
    .map(item => ({
      ...item,
      horas_operativas: Number((item.duracion_segundos / 3600).toFixed(2),),
    }))
    .sort(
      (a, b) =>
        a.fecha.localeCompare(
          b.fecha,
        ),
    );
};


module.exports = {
  buildPorFecha,
  buildPorSereno,
  buildPorUnidad,
  buildPorZona,
}
