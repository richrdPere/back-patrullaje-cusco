const { Op, fn, col, where: whereFn } = require("sequelize");
const db = require("../../../../database/models");

const { Policia, Persona } = db;

// ======================================================
// LISTAR POLICÍAS PAGINADO + FILTROS
// ======================================================
const getPoliciasService = async (query) => {

  const {
    page = 1,
    limit = 5,
    nombres = "",
    dni = ""
  } = query;

  const offset = (page - 1) * limit;

  const wherePersona = {};
  const filtros = [];

  // ==========================
  // FILTRO POR NOMBRES COMPLETOS
  // ==========================
  if (nombres) {
    filtros.push(
      whereFn(
        fn(
          "concat",
          col("persona.nombres"),
          " ",
          col("persona.apellidos")
        ),
        {
          [Op.like]: `%${nombres.trim()}%`
        }
      )
    );
  }

  // ==========================
  // FILTRO POR DNI
  // ==========================
  if (dni) {
    filtros.push({
      documento_identidad: {
        [Op.like]: `%${dni.trim()}%`
      }
    });
  }

  if (filtros.length > 0) {
    wherePersona[Op.and] = filtros;
  }

  // ==========================
  // QUERY PRINCIPAL
  // ==========================
  const { count, rows } = await Policia.findAndCountAll({
    include: [
      {
        model: Persona,
        as: "persona",
        where: wherePersona
      }
    ],
    limit: parseInt(limit),
    offset: parseInt(offset),
    order: [["id", "DESC"]],
    distinct: true
  });

  return {
    total: count,
    page: parseInt(page),
    limit: parseInt(limit),
    totalPages: Math.ceil(count / limit),
    data: rows
  };

};

module.exports = getPoliciasService