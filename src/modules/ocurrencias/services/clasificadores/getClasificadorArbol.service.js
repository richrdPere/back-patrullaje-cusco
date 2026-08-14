// services/ocurrencias/clasificador/get-clasificador-arbol.service.js
const db = require('../../../../database/models');

// Modelos
const {
  OcurrenciaClasificadorVersion,
  OcurrenciaCategoriaGenerica,
  OcurrenciaCategoriaEspecifica,
  OcurrenciaModalidad,
  OcurrenciaModalidadRegla,
} = db;


const getClasificadorArbol = async ({
  soloActivos = true,
  versionId = null,
  incluirReglas = true,
} = {}) => {
  const whereVersion = {};
  const whereGenerica = {};
  const whereEspecifica = {};
  const whereModalidad = {};
  const whereRegla = {};

  // =====================================================
  // FILTRO POR ESTADO
  // =====================================================
  if (soloActivos) {
    whereVersion.estado = true;
    whereGenerica.estado = true;
    whereEspecifica.estado = true;
    whereModalidad.estado = true;
    whereRegla.estado = true;
  }

  // =====================================================
  // FILTRO POR VERSIÓN
  // =====================================================
  if (versionId) {
    whereVersion.id = Number(versionId);
    whereGenerica.version_id = Number(versionId);
  }

  // =====================================================
  // INCLUDE DE MODALIDADES
  // =====================================================
  const includeModalidad = {
    model: OcurrenciaModalidad,
    as: 'modalidades',
    required: false,

    where:
      Object.keys(whereModalidad).length > 0
        ? whereModalidad
        : undefined,

    attributes: [
      'id',
      'categoria_especifica_id',
      'codigo',
      'nombre',
      'descripcion',
      'requiere_autor',
      'requiere_victima',
      'requiere_conductor',
      'requiere_datos_pnp',
      'requiere_descripcion',
      'orden',
      'vigencia_desde',
      'vigencia_hasta',
      'estado',
    ],
  };

  if (incluirReglas) {
    includeModalidad.include = [
      {
        model: OcurrenciaModalidadRegla,
        as: 'reglas',
        required: false,

        where:
          Object.keys(whereRegla).length > 0
            ? whereRegla
            : undefined,

        attributes: [
          'id',
          'modalidad_id',
          'clave',
          'descripcion',
          'parametros',
          'estado',
        ],
      },
    ];
  }

  // =====================================================
  // CONSULTA
  // =====================================================
  return OcurrenciaCategoriaGenerica.findAll({
    where: whereGenerica,

    attributes: [
      'id',
      'version_id',
      'codigo',
      'nombre',
      'descripcion',
      'orden',
      'estado',
    ],

    include: [
      {
        model: OcurrenciaClasificadorVersion,
        as: 'version',
        required: true,
        where: whereVersion,

        attributes: [
          'id',
          'nombre',
          'resolucion',
          'descripcion',
          'fecha_publicacion',
          'vigencia_desde',
          'vigencia_hasta',
          'estado',
        ],
      },

      {
        model: OcurrenciaCategoriaEspecifica,
        as: 'categorias_especificas',
        required: false,

        where:
          Object.keys(whereEspecifica).length > 0
            ? whereEspecifica
            : undefined,

        attributes: [
          'id',
          'categoria_generica_id',
          'codigo',
          'nombre',
          'descripcion',
          'orden',
          'estado',
        ],

        include: [
          includeModalidad,
        ],
      },
    ],

    order: [
      ['orden', 'ASC'],
      ['codigo', 'ASC'],

      [
        {
          model: OcurrenciaCategoriaEspecifica,
          as: 'categorias_especificas',
        },
        'orden',
        'ASC',
      ],

      [
        {
          model: OcurrenciaCategoriaEspecifica,
          as: 'categorias_especificas',
        },
        'codigo',
        'ASC',
      ],

      [
        {
          model: OcurrenciaCategoriaEspecifica,
          as: 'categorias_especificas',
        },
        {
          model: OcurrenciaModalidad,
          as: 'modalidades',
        },
        'orden',
        'ASC',
      ],

      [
        {
          model: OcurrenciaCategoriaEspecifica,
          as: 'categorias_especificas',
        },
        {
          model: OcurrenciaModalidad,
          as: 'modalidades',
        },
        'codigo',
        'ASC',
      ],
    ],
  });
};

module.exports = getClasificadorArbol;