const db = require("../../../../database/models");

// Modelos
const {
  PatrullajeGps,
  PatrullajeProgramado,
} = db;

// Utils
const { calculateDistanceBetweenPoints, } = require("../../../../utils/distance.helper");

// Service
const getRecorridoPatrullajeService = async (patrullajeId) => {

  const id = Number(patrullajeId);

  if (
    !Number.isInteger(id) ||
    id <= 0
  ) {
    throw new Error(
      "El identificador del patrullaje no es válido.",
    );
  }

  // ==========================================
  // 1. OBTENER PATRULLAJE
  // ==========================================
  const patrullaje = await PatrullajeProgramado.findByPk(
    id,
    {
      attributes: [
        "id",
        "estado",
        "fecha",
        "hora_inicio",
        "hora_fin",
      ],
    },
  );

  if (!patrullaje) {
    throw new Error(
      "El patrullaje solicitado no existe.",
    );
  }

  // ==========================================
  // 2. OBTENER PUNTOS GPS ORDENADOS
  // ==========================================
  const registros = await PatrullajeGps.findAll({
    where: {
      patrullaje_id: id,
    },

    attributes: [
      "id",
      "usuario_id",
      "latitud",
      "longitud",
      "velocidad",
      "precision",
      "fecha_hora",
      "tipo",
    ],

    order: [
      ["fecha_hora", "ASC"],
      ["id", "ASC"],
    ],
  });

  // ==========================================
  // 3. NORMALIZAR PUNTOS
  // ==========================================
  const puntos = registros
    .map((registro) => ({
      id: registro.id,
      usuarioId: registro.usuario_id,
      lat: Number(registro.latitud),
      lng: Number(registro.longitud),
      velocidad: registro.velocidad !== null
        ? Number(registro.velocidad)
        : null,

      precision: registro.precision !== null
        ? Number(registro.precision)
        : null,

      fechaHora: new Date(
        registro.fecha_hora,
      ).toISOString(),

      tipo: registro.tipo,
    }))
    .filter(
      (punto) =>
        Number.isFinite(punto.lat) &&
        Number.isFinite(punto.lng),
    );

  // ==========================================
  // 4. CALCULAR DISTANCIA
  // ==========================================
  let distanciaMetros = 0;

  for (
    let index = 1;
    index < puntos.length;
    index++
  ) {
    const anterior =
      puntos[index - 1];

    const actual =
      puntos[index];

    const distancia =
      calculateDistanceBetweenPoints(
        anterior.lat,
        anterior.lng,
        actual.lat,
        actual.lng,
      );

    if (
      Number.isFinite(distancia) &&
      distancia >= 0
    ) {
      distanciaMetros += distancia;
    }
  }

  // ==========================================
  // 5. CALCULAR VELOCIDAD PROMEDIO
  // ==========================================

  const velocidades = puntos
    .map((punto) => punto.velocidad)
    .filter(
      (velocidad) =>
        velocidad !== null &&
        Number.isFinite(velocidad) &&
        velocidad >= 0,
    );

  /*
   * Geolocator entrega normalmente m/s.
   * Convertimos a km/h.
   */
  const velocidadPromedioMs =
    velocidades.length > 0
      ? velocidades.reduce(
        (total, velocidad) =>
          total + velocidad,
        0,
      ) / velocidades.length
      : 0;

  const velocidadPromedioKmh = velocidadPromedioMs * 3.6;

  const ultimaActualizacion = puntos.length > 0
    ? puntos[puntos.length - 1].fechaHora
    : null;

  return {
    patrullaje: {
      id: patrullaje.id,
      estado: patrullaje.estado,
      fechaInicio: patrullaje.fecha_inicio
        ? new Date(
          patrullaje.fecha_inicio,
        ).toISOString()
        : null,

      fechaFin: patrullaje.fecha_fin
        ? new Date(
          patrullaje.fecha_fin,
        ).toISOString()
        : null,
    },

    resumen: {
      totalPuntos: puntos.length,
      distanciaMetros: Number(distanciaMetros.toFixed(2),),
      distanciaKilometros: Number((distanciaMetros / 1000).toFixed(2),),
      velocidadPromedioKmh: Number(velocidadPromedioKmh.toFixed(2),),
      ultimaActualizacion,
    },

    puntos,
  };
};

module.exports = getRecorridoPatrullajeService;