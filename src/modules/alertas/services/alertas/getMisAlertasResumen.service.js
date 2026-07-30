const { Op, fn, col } = require("sequelize");
const db = require("../../../../database/models");

// Models
const {
  Alerta,
  AlertaDestinatario,
  Usuario,
  Zonas
} = db;

// Service
const getMisAlertasResumenService = async ({
  usuario_id,
}) => {
  if (
    !Number.isInteger(Number(usuario_id)) ||
    Number(usuario_id) <= 0
  ) {
    throw new Error(
      "El identificador del usuario no es válido"
    );
  }

  const usuarioId = Number(usuario_id);

  /*
   * Se excluyen las alertas canceladas del resumen operativo.
   *
   * Las alertas expiradas pueden mantenerse visibles para fines
   * históricos, pero no se consideran pendientes de atención.
   */
  const alertaActivaWhere = {
    estado: {
      [Op.ne]: "CANCELADA",
    },
  };

  // ======================================================
  // TOTALES POR ESTADO DEL DESTINATARIO
  // ======================================================
  const estadosAgrupados =
    await AlertaDestinatario.findAll({
      attributes: [
        "estado",
        [
          fn("COUNT", col("AlertaDestinatario.id")),
          "total",
        ],
      ],
      where: {
        usuario_id: usuarioId,
      },
      include: [
        {
          model: Alerta,
          as: "alerta",
          required: true,
          attributes: [],
          where: alertaActivaWhere,
        },
      ],
      group: [
        "AlertaDestinatario.estado",
      ],
      raw: true,
    });

  const conteoEstados = {
    PENDIENTE: 0,
    RECIBIDA: 0,
    LEIDA: 0,
    ACEPTADA: 0,
    RECHAZADA: 0,
    ATENDIDA: 0,
  };

  for (const item of estadosAgrupados) {
    const estado = item.estado;
    const total = Number(item.total) || 0;

    if (
      Object.prototype.hasOwnProperty.call(
        conteoEstados,
        estado
      )
    ) {
      conteoEstados[estado] = total;
    }
  }

  // ======================================================
  // TOTALES GENERALES
  // ======================================================

  const total = Object.values(
    conteoEstados
  ).reduce(
    (acumulado, valor) =>
      acumulado + valor,
    0
  );

  /*
   * Una alerta se considera no leída mientras su estado sea:
   *
   * - PENDIENTE: aún no existe confirmación de entrega.
   * - RECIBIDA: llegó al dispositivo, pero el usuario no la abrió.
   */
  const noLeidas =
    conteoEstados.PENDIENTE +
    conteoEstados.RECIBIDA;

  /*
   * Las alertas que todavía requieren alguna acción operativa.
   */
  const porAtender =
    conteoEstados.PENDIENTE +
    conteoEstados.RECIBIDA +
    conteoEstados.LEIDA +
    conteoEstados.ACEPTADA;

  // ======================================================
  // CONTEO POR PRIORIDAD
  // ======================================================

  const prioridadesAgrupadas =
    await AlertaDestinatario.findAll({
      attributes: [
        [
          col("alerta.prioridad"),
          "prioridad",
        ],
        [
          fn("COUNT", col("AlertaDestinatario.id")),
          "total",
        ],
      ],
      where: {
        usuario_id: usuarioId,
      },
      include: [
        {
          model: Alerta,
          as: "alerta",
          required: true,
          attributes: [],
          where: alertaActivaWhere,
        },
      ],
      group: [
        "alerta.prioridad",
      ],
      raw: true,
    });

  const conteoPrioridades = {
    BAJA: 0,
    MEDIA: 0,
    ALTA: 0,
    CRITICA: 0,
  };

  for (const item of prioridadesAgrupadas) {
    const prioridad = item.prioridad;
    const totalPrioridad =
      Number(item.total) || 0;

    if (
      Object.prototype.hasOwnProperty.call(
        conteoPrioridades,
        prioridad
      )
    ) {
      conteoPrioridades[prioridad] =
        totalPrioridad;
    }
  }

  // ======================================================
  // ALERTAS QUE REQUIEREN CONFIRMACIÓN
  // ======================================================

  const requierenConfirmacion =
    await AlertaDestinatario.count({
      where: {
        usuario_id: usuarioId,
        estado: {
          [Op.in]: [
            "PENDIENTE",
            "RECIBIDA",
            "LEIDA",
          ],
        },
      },
      include: [
        {
          model: Alerta,
          as: "alerta",
          required: true,
          attributes: [],
          where: {
            estado: {
              [Op.notIn]: [
                "CANCELADA",
                "ATENDIDA",
                "EXPIRADA",
              ],
            },
            requiere_confirmacion: true,
          },
        },
      ],
    });

  // ======================================================
  // ALERTAS EXPIRADAS
  // ======================================================

  const expiradas =
    await AlertaDestinatario.count({
      where: {
        usuario_id: usuarioId,
      },
      include: [
        {
          model: Alerta,
          as: "alerta",
          required: true,
          attributes: [],
          where: {
            [Op.or]: [
              {
                estado: "EXPIRADA",
              },
              {
                fecha_expiracion: {
                  [Op.lt]: new Date(),
                },
                estado: {
                  [Op.notIn]: [
                    "ATENDIDA",
                    "CANCELADA",
                  ],
                },
              },
            ],
          },
        },
      ],
    });

  // ======================================================
  // ÚLTIMA ALERTA RECIBIDA
  // ======================================================

  const ultimaRecepcion =
    await AlertaDestinatario.findOne({
      where: {
        usuario_id: usuarioId,
      },
      attributes: [
        "id",
        "alerta_id",
        "estado",
        "fecha_recibida",
        "fecha_leida",
        "fecha_respuesta",
        "fecha_atendida",
      ],
      include: [
        {
          model: Alerta,
          as: "alerta",
          required: true,
          where: alertaActivaWhere,
          attributes: [
            "id",
            "titulo",
            "descripcion",
            "tipo",
            "prioridad",
            "latitud",
            "longitud",
            "requiere_confirmacion",
            "fecha_expiracion",
            "estado",
            "createdAt",
            "updatedAt",
          ],
          include: [
            {
              model: Usuario,
              as: "emisor",
              attributes: [
                "id",
                "username",
                "correo",
              ],
            },
            {
              model: Zonas,
              as: "zona",
              attributes: [
                "id",
                "nombre",
              ],
              required: false,
            },
          ],
        },
      ],
      order: [
        [
          {
            model: Alerta,
            as: "alerta",
          },
          "createdAt",
          "DESC",
        ],
      ],
    });

  return {
    total,
    no_leidas: noLeidas,
    por_atender: porAtender,

    estados: {
      pendientes:
        conteoEstados.PENDIENTE,
      recibidas:
        conteoEstados.RECIBIDA,
      leidas:
        conteoEstados.LEIDA,
      aceptadas:
        conteoEstados.ACEPTADA,
      rechazadas:
        conteoEstados.RECHAZADA,
      atendidas:
        conteoEstados.ATENDIDA,
    },

    prioridades: {
      bajas:
        conteoPrioridades.BAJA,
      medias:
        conteoPrioridades.MEDIA,
      altas:
        conteoPrioridades.ALTA,
      criticas:
        conteoPrioridades.CRITICA,
    },

    requieren_confirmacion:
      requierenConfirmacion,

    expiradas,

    ultima_alerta:
      ultimaRecepcion || null,
  };
};

module.exports = getMisAlertasResumenService;