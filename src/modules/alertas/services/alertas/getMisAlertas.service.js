const { Op } = require("sequelize");
const db = require("../../../../database/models");

// Models
const {
  Alerta,
  AlertaDestinatario,
  Usuario,
  PatrullajeProgramado,
  Zonas,
  Incidencia
} = db;

const getMisAlertasService = async ({
  usuario_id,
  page = 1,
  limit = 10,
  estado = null,
  prioridad = null,
  tipo = null,
  no_leidas = false,
}) => {
  const currentPage = Math.max(
    Number.parseInt(page, 10) || 1,
    1
  );

  const pageLimit = Math.min(
    Math.max(
      Number.parseInt(limit, 10) || 10,
      1
    ),
    50
  );

  const offset =
    (currentPage - 1) * pageLimit;

  const destinatarioWhere = {
    usuario_id,
  };

  if (estado) {
    destinatarioWhere.estado = estado;
  }

  if (
    no_leidas === true ||
    no_leidas === "true"
  ) {
    destinatarioWhere.estado = {
      [Op.in]: ["PENDIENTE", "RECIBIDA"],
    };
  }

  const alertaWhere = {};

  if (prioridad) {
    alertaWhere.prioridad = prioridad;
  }

  if (tipo) {
    alertaWhere.tipo = tipo;
  }

  alertaWhere.estado = {
    [Op.ne]: "CANCELADA",
  };

  const { count, rows } =
    await AlertaDestinatario.findAndCountAll({
      where: destinatarioWhere,
      include: [
        {
          model: Alerta,
          as: "alerta",
          required: true,
          where: alertaWhere,
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
            },
            {
              model: PatrullajeProgramado,
              as: "patrullaje",
            },
            {
              model: Incidencia,
              as: "incidencia",
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
      limit: pageLimit,
      offset,
      distinct: true,
    });

  const totalNoLeidas =
    await AlertaDestinatario.count({
      where: {
        usuario_id,
        estado: {
          [Op.in]: ["PENDIENTE", "RECIBIDA"],
        },
      },
      include: [
        {
          model: Alerta,
          as: "alerta",
          required: true,
          where: {
            estado: {
              [Op.ne]: "CANCELADA",
            },
          },
          attributes: [],
        },
      ],
    });

  return {
    data: rows,
    pagination: {
      page: currentPage,
      limit: pageLimit,
      total: count,
      totalPages: Math.ceil(
        count / pageLimit
      ),
    },
    no_leidas: totalNoLeidas,
  };
};

module.exports = getMisAlertasService;