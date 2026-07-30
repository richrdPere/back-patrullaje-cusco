const { Op } = require("sequelize");
const db = require("../../../../database/models");

// Modelos
const {
  Alerta,
  AlertaDestinatario,
  Usuario,
  Persona,
  Zonas,
  PatrullajeProgramado,
  Incidencia
} = db;


const getAlertasEmitidasService = async ({
  usuario_id,
  rol,
  page = 1,
  limit = 10,
  estado = null,
  tipo = null,
  prioridad = null,
  zona_id = null,
  patrullaje_id = null,
  requiere_confirmacion = null,
  fecha_inicio = null,
  fecha_fin = null,
  search = null,
  incluir_todas = false,
}) => {
  // ======================================================
  // VALIDAR USUARIO
  // ======================================================

  const emisorId = Number(usuario_id);

  if (!Number.isInteger(emisorId) || emisorId <= 0) {
    throw new Error(
      "El identificador del usuario emisor no es válido"
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
  // FILTROS
  // ======================================================

  const where = {};

  const rolesConAccesoGlobal = [
    "ADMIN",
    "GERENTE_SERENAZGO",
  ];

  const mostrarTodas =
    incluir_todas === true ||
    incluir_todas === "true";

  /*
   * Supervisor y operador consultan por defecto
   * únicamente sus propias alertas.
   *
   * ADMIN y GERENTE pueden consultar todas enviando:
   * ?incluir_todas=true
   */
  if (
    !mostrarTodas ||
    !rolesConAccesoGlobal.includes(rol)
  ) {
    where.emisor_id = emisorId;
  }

  if (estado) {
    where.estado = estado;
  }

  if (tipo) {
    where.tipo = tipo;
  }

  if (prioridad) {
    where.prioridad = prioridad;
  }

  if (zona_id !== null && zona_id !== "") {
    const zonaId = Number(zona_id);

    if (!Number.isInteger(zonaId) || zonaId <= 0) {
      throw new Error(
        "El identificador de la zona no es válido"
      );
    }

    where.zona_id = zonaId;
  }

  if (
    patrullaje_id !== null &&
    patrullaje_id !== ""
  ) {
    const patrullajeId = Number(patrullaje_id);

    if (
      !Number.isInteger(patrullajeId) ||
      patrullajeId <= 0
    ) {
      throw new Error(
        "El identificador del patrullaje no es válido"
      );
    }

    where.patrullaje_id = patrullajeId;
  }

  if (
    requiere_confirmacion !== null &&
    requiere_confirmacion !== undefined &&
    requiere_confirmacion !== ""
  ) {
    if (
      ![
        true,
        false,
        "true",
        "false",
        "1",
        "0",
        1,
        0,
      ].includes(requiere_confirmacion)
    ) {
      throw new Error(
        "El filtro requiere_confirmacion no es válido"
      );
    }

    where.requiere_confirmacion = [
      true,
      "true",
      "1",
      1,
    ].includes(requiere_confirmacion);
  }

  // ======================================================
  // FILTRO POR FECHAS
  // ======================================================

  if (fecha_inicio || fecha_fin) {
    where.createdAt = {};

    if (fecha_inicio) {
      const inicio = new Date(fecha_inicio);

      if (Number.isNaN(inicio.getTime())) {
        throw new Error(
          "La fecha de inicio no tiene un formato válido"
        );
      }

      inicio.setHours(0, 0, 0, 0);

      where.createdAt[Op.gte] = inicio;
    }

    if (fecha_fin) {
      const fin = new Date(fecha_fin);

      if (Number.isNaN(fin.getTime())) {
        throw new Error(
          "La fecha final no tiene un formato válido"
        );
      }

      fin.setHours(23, 59, 59, 999);

      where.createdAt[Op.lte] = fin;
    }
  }

  // ======================================================
  // BÚSQUEDA
  // ======================================================

  if (
    search &&
    typeof search === "string" &&
    search.trim()
  ) {
    const searchValue = search.trim();

    where[Op.or] = [
      {
        titulo: {
          [Op.like]: `%${searchValue}%`,
        },
      },
      {
        descripcion: {
          [Op.like]: `%${searchValue}%`,
        },
      },
    ];
  }

  // ======================================================
  // CONSULTAR ALERTAS
  // ======================================================

  const { count, rows } =
    await Alerta.findAndCountAll({
      where,
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
        {
          model: AlertaDestinatario,
          as: "destinatarios",
          required: false,
          attributes: [
            "id",
            "alerta_id",
            "usuario_id",
            "estado",
            "fecha_recibida",
            "fecha_leida",
            "fecha_respuesta",
            "fecha_atendida",
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
      limit: pageLimit,
      offset,
      distinct: true,
    });

  // ======================================================
  // FORMATEAR RESUMEN DE DESTINATARIOS
  // ======================================================

  const alertas = rows.map((alertaModel) => {
    const alerta = alertaModel.toJSON();

    const destinatarios =
      alerta.destinatarios || [];

    const resumenDestinatarios = {
      total: destinatarios.length,
      pendientes: 0,
      recibidas: 0,
      leidas: 0,
      aceptadas: 0,
      rechazadas: 0,
      atendidas: 0,
    };

    for (const destinatario of destinatarios) {
      switch (destinatario.estado) {
        case "PENDIENTE":
          resumenDestinatarios.pendientes += 1;
          break;

        case "RECIBIDA":
          resumenDestinatarios.recibidas += 1;
          break;

        case "LEIDA":
          resumenDestinatarios.leidas += 1;
          break;

        case "ACEPTADA":
          resumenDestinatarios.aceptadas += 1;
          break;

        case "RECHAZADA":
          resumenDestinatarios.rechazadas += 1;
          break;

        case "ATENDIDA":
          resumenDestinatarios.atendidas += 1;
          break;

        default:
          break;
      }
    }

    return {
      ...alerta,
      resumen_destinatarios:
        resumenDestinatarios,
    };
  });

  return {
    data: alertas,
    pagination: {
      page: currentPage,
      limit: pageLimit,
      total: count,
      totalPages: Math.ceil(count / pageLimit),
      hasNextPage:
        currentPage <
        Math.ceil(count / pageLimit),
      hasPreviousPage:
        currentPage > 1,
    },
  };
};

module.exports = getAlertasEmitidasService;