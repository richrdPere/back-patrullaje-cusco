const { Op } = require("sequelize");

const db = require("../../../../database/models");

// Modelos
const { UnidadPatrullaje } = db;

// Listar Unidades de Patrullaje
const getUnidadesPService = async (query) => {

  let {
    page = 1,
    limit = 10,
    filtros
  } = query;

  page = Number(page);
  limit = Number(limit);

  const offset = (page - 1) * limit;

  const where = {};

  if (filtros) {

    const filtrosObj =
      typeof filtros === "string"
        ? JSON.parse(filtros)
        : filtros;

    if (filtrosObj.placa) {
      where.placa = {
        [Op.like]: `%${filtrosObj.placa}%`
      };
    }

    if (filtrosObj.descripcion) {
      where.descripcion = {
        [Op.like]: `%${filtrosObj.descripcion}%`
      };
    }
  }

  const { count, rows } =
    await UnidadPatrullaje.findAndCountAll({
      where,
      limit,
      offset,
      order: [
        ["createdAt", "DESC"]
      ]
    });

  return {
    total: count,
    page,
    limit,
    totalPages: Math.ceil(count / limit),
    data: rows
  };
};

module.exports = getUnidadesPService;