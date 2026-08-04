const { Op } = require("sequelize");
const db = require("../../../../database/models");

// Models
const {
  Alerta,
  AlertaDestinatario,
  Usuario,
  Persona,
  Zonas,
  PatrullajeProgramado,
  Incidencia,
} = db;

// Service
const getAlertaDestinatariosService = async ({
  alerta_id,
  usuario_id,
  rol,
  page = 1,
  limit = 10,
  estado = null,
  search = null,
}) => {
  // ======================================================
  // VALIDACIONES BÁSICAS
  // ======================================================

  const alertaId = Number(alerta_id);
  const usuarioId = Number(usuario_id);

  if (!Number.isInteger(alertaId) || alertaId <= 0) {
    throw new Error(
      "El identificador de la alerta no es válido"
    );
  }

  if (!Number.isInteger(usuarioId) || usuarioId <= 0) {
    throw new Error(
      "El identificador del usuario no es válido"
    );
  }

  // ======================================================
  // PAGINACIÓN
  // ======================================================

  const currentPage = Math.max(
    Number.parseInt(page, 10) || 1,
    1
  );

  const pageLimit = Math.min(
    Math.max(Number.parseInt(limit, 10) || 10, 1),
    100
  );

  const offset = (currentPage - 1) * pageLimit;

  // ======================================================
  // VALIDAR EXISTENCIA Y ACCESO A LA ALERTA
  // ======================================================

  const alerta = await Alerta.findByPk(alertaId, {
    attributes: [
      "id",
      "emisor_id",
      "patrullaje_id",
      "zona_id",
      "incidencia_id",
      "titulo",
      "tipo",
      "prioridad",
      "descripcion",
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
          "estado",
        ],
        include: Persona
          ? [
            {
              model: Persona,
              as: "persona",
              required: false,
              attributes: [
                "id",
                "nombres",
                "apellidos",
                "documento_identidad",
                "foto_perfil"
              ],
            },
          ]
          : [],
      },
      {
        model: Zonas,
        as: "zona",
        required: false,
        attributes: [
          "id",
          "nombre",
        ],
      },
      {
        model: PatrullajeProgramado,
        as: "patrullaje",
        required: false,
        attributes: [
          "id",
          "estado",
          "fecha",
          "hora_inicio",
          "hora_fin",
        ],
      },
      {
        model: Incidencia,
        as: "incidencia",
        required: false,
        attributes: [
          "id",
          "tipo",
          "descripcion",
          "estado",
          "fecha_hora",
        ],
      },
    ],
  });

  if (!alerta) {
    throw new Error(
      "La alerta solicitada no existe"
    );
  }

  const rolesConAccesoGlobal = [
    "ADMIN",
    "GERENTE_SERENAZGO",
  ];

  const tieneAccesoGlobal =
    rolesConAccesoGlobal.includes(rol);

  if (
    !tieneAccesoGlobal &&
    Number(alerta.emisor_id) !== usuarioId
  ) {
    throw new Error(
      "No tiene permisos para consultar los destinatarios de esta alerta"
    );
  }

  // ======================================================
  // FILTROS DE DESTINATARIOS
  // ======================================================

  const destinatarioWhere = {
    alerta_id: alertaId,
  };

  const estadosPermitidos = [
    "PENDIENTE",
    "RECIBIDA",
    "LEIDA",
    "ACEPTADA",
    "RECHAZADA",
    "ATENDIDA",
  ];

  if (estado) {
    const estadoNormalizado = String(
      estado
    ).toUpperCase();

    if (
      !estadosPermitidos.includes(
        estadoNormalizado
      )
    ) {
      throw new Error(
        "El estado del destinatario no es válido"
      );
    }

    destinatarioWhere.estado =
      estadoNormalizado;
  }

  // ======================================================
  // FILTRO POR USUARIO O PERSONA
  // ======================================================

  const usuarioWhere = {};
  const personaWhere = {};

  if (
    search &&
    typeof search === "string" &&
    search.trim()
  ) {
    const searchValue = search.trim();

    usuarioWhere[Op.or] = [
      {
        username: {
          [Op.like]: `%${searchValue}%`,
        },
      },
      {
        correo: {
          [Op.like]: `%${searchValue}%`,
        },
      },
    ];

    personaWhere[Op.or] = [
      {
        nombres: {
          [Op.like]: `%${searchValue}%`,
        },
      },
      {
        apellidos: {
          [Op.like]: `%${searchValue}%`,
        },
      },
    ];
  }

  // ======================================================
  // CONSULTAR DESTINATARIOS
  // ======================================================
  const usuarioInclude = {
    model: Usuario,
    as: "destinatario",
    required: true,
    attributes: [
      "id",
      "username",
      "correo",
      "estado",
    ],
  };

  if (
    Object.keys(usuarioWhere).length > 0
  ) {
    usuarioInclude.where = usuarioWhere;
  }

  if (Persona) {
    usuarioInclude.include = [
      {
        model: Persona,
        as: "persona",
        required: false,
        attributes: [
          "id",
          "nombres",
          "apellidos",
          "documento_identidad",
          "telefono",
          "foto_perfil"
        ],
      },
    ];
  }

  const { count, rows } =
    await AlertaDestinatario.findAndCountAll({
      where: destinatarioWhere,
      attributes: [
        "id",
        "alerta_id",
        "usuario_id",
        "estado",
        "fecha_recibida",
        "fecha_leida",
        "fecha_respuesta",
        "fecha_atendida",
        "observacion",
        "createdAt",
        "updatedAt",
      ],
      include: [usuarioInclude],
      order: [
        ["createdAt", "ASC"],
      ],
      limit: pageLimit,
      offset,
      distinct: true,
    });

  // ======================================================
  // FILTRAR POR PERSONA
  // ======================================================
  /*
   * Sequelize complica el OR entre campos de Usuario y Persona
   * cuando ambas tablas son opcionales.
   *
   * Esta primera implementación realiza búsqueda directa sobre
   * username y correo. Si necesitas incluir nombres y apellidos,
   * más abajo incluyo una versión alternativa del include.
   */

  // ======================================================
  // RESUMEN GENERAL DE ESTADOS
  // El resumen no depende del filtro de paginación.
  // ======================================================

  const estadosAgrupados =
    await AlertaDestinatario.findAll({
      where: {
        alerta_id: alertaId,
      },
      attributes: [
        "estado",
        [
          db.sequelize.fn(
            "COUNT",
            db.sequelize.col(
              "AlertaDestinatario.id"
            )
          ),
          "total",
        ],
      ],
      group: [
        "AlertaDestinatario.estado",
      ],
      raw: true,
    });

  const resumenDestinatarios = {
    total: 0,
    pendientes: 0,
    recibidas: 0,
    leidas: 0,
    aceptadas: 0,
    rechazadas: 0,
    atendidas: 0,
  };

  for (const item of estadosAgrupados) {
    const totalEstado =
      Number(item.total) || 0;

    resumenDestinatarios.total +=
      totalEstado;

    switch (item.estado) {
      case "PENDIENTE":
        resumenDestinatarios.pendientes =
          totalEstado;
        break;

      case "RECIBIDA":
        resumenDestinatarios.recibidas =
          totalEstado;
        break;

      case "LEIDA":
        resumenDestinatarios.leidas =
          totalEstado;
        break;

      case "ACEPTADA":
        resumenDestinatarios.aceptadas =
          totalEstado;
        break;

      case "RECHAZADA":
        resumenDestinatarios.rechazadas =
          totalEstado;
        break;

      case "ATENDIDA":
        resumenDestinatarios.atendidas =
          totalEstado;
        break;

      default:
        break;
    }
  }

  // ======================================================
  // MÉTRICAS DERIVADAS
  // ======================================================

  const noLeidas =
    resumenDestinatarios.pendientes +
    resumenDestinatarios.recibidas;

  const respondidas =
    resumenDestinatarios.aceptadas +
    resumenDestinatarios.rechazadas +
    resumenDestinatarios.atendidas;

  const pendientesDeAtencion =
    resumenDestinatarios.pendientes +
    resumenDestinatarios.recibidas +
    resumenDestinatarios.leidas +
    resumenDestinatarios.aceptadas;

  const totalPages = Math.ceil(
    count / pageLimit
  );

  return {
    alerta,
    resumen: {
      ...resumenDestinatarios,
      no_leidas: noLeidas,
      respondidas,
      pendientes_de_atencion:
        pendientesDeAtencion,
    },
    destinatarios: rows,
    pagination: {
      page: currentPage,
      limit: pageLimit,
      total: count,
      totalPages,
      hasNextPage:
        currentPage < totalPages,
      hasPreviousPage:
        currentPage > 1,
    },
  };
};

module.exports = getAlertaDestinatariosService;