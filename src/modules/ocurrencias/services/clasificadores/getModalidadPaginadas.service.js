// services/ocurrencias/clasificador/get-modalidades-paginadas.service.js

const { Op } = require('sequelize');
const db = require('../../../../database/models');

// Modelos
const {
  OcurrenciaClasificadorVersion,
  OcurrenciaCategoriaGenerica,
  OcurrenciaCategoriaEspecifica,
  OcurrenciaModalidad,
  OcurrenciaModalidadRegla,
} = db;

// Utils
const parseBoolean = (value) => {
  if (
    value === true ||
    value === 'true' ||
    value === 1 ||
    value === '1'
  ) {
    return true;
  }

  if (
    value === false ||
    value === 'false' ||
    value === 0 ||
    value === '0'
  ) {
    return false;
  }

  return null;
};

// SERVICES 
const getModalidadesPaginadas = async ({
  page = 1,
  limit = 20,
  search = '',
  codigo = '',
  categoriaGenericaId = null,
  categoriaEspecificaId = null,
  versionId = null,
  estado = true,
  incluirReglas = true,
}) => {
  const parsedPage = Math.max(
    Number.parseInt(page, 10) || 1,
    1,
  );

  const parsedLimit = Math.min(
    Math.max(Number.parseInt(limit, 10) || 20, 1),
    100,
  );

  const offset = (parsedPage - 1) * parsedLimit;

  const whereModalidad = {};
  const whereCategoriaEspecifica = {};
  const whereCategoriaGenerica = {};
  const whereVersion = {};

  // =====================================================
  // ESTADO
  // =====================================================
  const estadoParsed = parseBoolean(estado);

  if (estadoParsed !== null) {
    whereModalidad.estado = estadoParsed;
  }

  // =====================================================
  // CÓDIGO
  // =====================================================
  const codigoLimpio = String(codigo || '').trim();

  if (codigoLimpio) {
    whereModalidad.codigo = {
      [Op.like]: `%${codigoLimpio}%`,
    };
  }

  // =====================================================
  // BÚSQUEDA GENERAL
  // =====================================================
  const searchLimpio = String(search || '').trim();

  if (searchLimpio) {
    whereModalidad[Op.or] = [
      {
        codigo: {
          [Op.like]: `%${searchLimpio}%`,
        },
      },
      {
        nombre: {
          [Op.like]: `%${searchLimpio}%`,
        },
      },
      {
        descripcion: {
          [Op.like]: `%${searchLimpio}%`,
        },
      },
    ];
  }

  // =====================================================
  // FILTROS JERÁRQUICOS
  // =====================================================
  if (categoriaEspecificaId) {
    whereModalidad.categoria_especifica_id =
      Number(categoriaEspecificaId);
  }

  if (categoriaGenericaId) {
    whereCategoriaEspecifica.categoria_generica_id =
      Number(categoriaGenericaId);
  }

  if (versionId) {
    whereCategoriaGenerica.version_id =
      Number(versionId);

    whereVersion.id = Number(versionId);
  }

  // =====================================================
  // INCLUDES
  // =====================================================
  const include = [
    {
      model: OcurrenciaCategoriaEspecifica,
      as: 'categoria_especifica',
      required: Boolean(
        categoriaGenericaId || versionId,
      ),
      where:
        Object.keys(whereCategoriaEspecifica).length > 0
          ? whereCategoriaEspecifica
          : undefined,

      include: [
        {
          model: OcurrenciaCategoriaGenerica,
          as: 'categoria_generica',
          required: Boolean(versionId),
          where:
            Object.keys(whereCategoriaGenerica).length > 0
              ? whereCategoriaGenerica
              : undefined,

          include: [
            {
              model: OcurrenciaClasificadorVersion,
              as: 'version',
              required: Boolean(versionId),
              where:
                Object.keys(whereVersion).length > 0
                  ? whereVersion
                  : undefined,

              attributes: [
                'id',
                'nombre',
                'resolucion',
                'fecha_publicacion',
                'vigencia_desde',
                'vigencia_hasta',
                'estado',
              ],
            },
          ],
        },
      ],
    },
  ];

  if (incluirReglas) {
    include.push({
      model: OcurrenciaModalidadRegla,
      as: 'reglas',
      required: false,
      where: {
        estado: true,
      },
    });
  }

  // =====================================================
  // CONSULTA
  // =====================================================
  const { count, rows } =
    await OcurrenciaModalidad.findAndCountAll({
      where: whereModalidad,
      include,
      distinct: true,
      col: 'id',
      limit: parsedLimit,
      offset,

      order: [
        ['codigo', 'ASC'],
      ],
    });

  return {
    data: rows,

    pagination: {
      totalItems: count,
      totalPages: Math.ceil(count / parsedLimit),
      currentPage: parsedPage,
      pageSize: parsedLimit,
      hasNextPage: parsedPage < Math.ceil(count / parsedLimit),
      hasPreviousPage: parsedPage > 1,
    },
  };
};

module.exports = getModalidadesPaginadas;