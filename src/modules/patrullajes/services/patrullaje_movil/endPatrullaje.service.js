const db = require("../../../../database/models");
const { Op } = require("sequelize");

const {
  sequelize,
  PatrullajeProgramado,
  PatrullajePersonal,
  PatrullajeResumen,
  PatrullajeGps,
  Incidencia,
  HistorialPatrullaje
} = db;

const { calculateTotalDistance } = require("../../../../utils/distance.helper");

// Service
const endPatrullajeService = async (
  patrullajeId,
  usuarioId,
  observacionFinal = null,
) => {
  const transaction = await sequelize.transaction();

  try {
    const patrullaje = await PatrullajeProgramado.findOne({
      where: {
        id: patrullajeId,
        estado: "EN_CURSO",
      },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!patrullaje) {
      throw new Error(
        "El patrullaje no existe o no se encuentra en curso.",
      );
    }

    const personal = await PatrullajePersonal.findOne({
      where: {
        patrullaje_id: patrullajeId,
        usuario_id: usuarioId,
        tipo_personal: "SERENO",
        estado: {
          [Op.in]: ["ACEPTADO", "EN_SERVICIO"],
        },
      },
      transaction,
    });

    if (!personal) {
      throw new Error(
        "El sereno no está autorizado para finalizar este patrullaje.",
      );
    }

    const puntosGps = await PatrullajeGps.findAll({
      where: {
        patrullaje_id: patrullajeId,
        tipo: "TRACKING",
      },
      attributes: [
        "id",
        "latitud",
        "longitud",
        "velocidad",
        "precision",
        "fecha_hora",
      ],
      order: [["fecha_hora", "ASC"]],
      transaction,
    });

    const totalIncidencias = await Incidencia.count({
      where: {
        patrullaje_id: patrullajeId,
        estado: {
          [Op.ne]: "ELIMINADO",
        },
      },
      transaction,
    });

    const totalObservaciones =
      await HistorialPatrullaje.count({
        where: {
          patrullaje_id: patrullajeId,
          estado: "ACTIVO",
        },
        transaction,
      });

    const distanciaTotalMetros =
      calculateTotalDistance(puntosGps);

    const fechaFin = new Date();

    const primerPuntoGps = puntosGps[0];
    const ultimoPuntoGps =
      puntosGps.length > 0
        ? puntosGps[puntosGps.length - 1]
        : null;

    const fechaInicio =
      patrullaje.fecha_inicio_real ??
      primerPuntoGps?.fecha_hora ??
      patrullaje.updatedAt;

    const duracionSegundos = Math.max(
      0,
      Math.floor(
        (fechaFin.getTime() -
          new Date(fechaInicio).getTime()) /
        1000,
      ),
    );

    const [resumen] =
      await PatrullajeResumen.findOrCreate({
        where: {
          patrullaje_id: patrullajeId,
        },
        defaults: {
          patrullaje_id: patrullajeId,
          usuario_finaliza_id: usuarioId,
          fecha_inicio: fechaInicio,
          fecha_fin: fechaFin,
          duracion_segundos: duracionSegundos,
          distancia_total_metros:
            distanciaTotalMetros,
          total_puntos_recorrido:
            puntosGps.length,
          total_incidencias:
            totalIncidencias,
          total_observaciones:
            totalObservaciones,
          observacion_final:
            observacionFinal?.trim() || null,

          latitud_inicio:
            primerPuntoGps?.latitud ?? null,

          longitud_inicio:
            primerPuntoGps?.longitud ?? null,

          latitud_fin:
            ultimoPuntoGps?.latitud ?? null,

          longitud_fin:
            ultimoPuntoGps?.longitud ?? null,
        },
        transaction,
      });

    await patrullaje.update(
      {
        estado: "FINALIZADO",
        fecha_fin_real: fechaFin,
      },
      {
        transaction,
      },
    );

    await personal.update(
      {
        estado: "FINALIZADO",
      },
      {
        transaction,
      },
    );

    await transaction.commit();

    return await PatrullajeProgramado.findByPk(
      patrullajeId,
      {
        include: [
          {
            model: db.Zonas,
            as: "zona",
          },
          {
            model: db.UnidadPatrullaje,
            as: "unidad",
          },
          {
            model: db.PatrullajeResumen,
            as: "resumen",
          },
        ],
      },
    );
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};


module.exports = endPatrullajeService;