// services/ocurrencias/clasificador/get-modalidad-by-codigo.service.js

const db = require('../../../../database/models');

// Modalidades
const {
  OcurrenciaClasificadorVersion,
  OcurrenciaCategoriaGenerica,
  OcurrenciaCategoriaEspecifica,
  OcurrenciaModalidad,
  OcurrenciaModalidadRegla,
} = db;

// SERVICES
const getModalidadByCodigo = async (
  codigo,
  {
    soloActivas = false,
    incluirReglas = true,
  } = {},
) => {
  const codigoLimpio = String(codigo || '').trim();

  if (!/^\d{6}$/.test(codigoLimpio)) {
    const error = new Error(
      'El código debe contener exactamente seis dígitos.',
    );

    error.statusCode = 400;
    throw error;
  }

  const whereModalidad = {
    codigo: codigoLimpio,
  };

  if (soloActivas) {
    whereModalidad.estado = true;
  }

  const include = [
    {
      model: OcurrenciaCategoriaEspecifica,
      as: 'categoria_especifica',
      required: true,

      include: [
        {
          model: OcurrenciaCategoriaGenerica,
          as: 'categoria_generica',
          required: true,

          include: [
            {
              model: OcurrenciaClasificadorVersion,
              as: 'version',
              required: true,

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
      where: soloActivas
        ? {
          estado: true,
        }
        : undefined,
    });
  }

  return OcurrenciaModalidad.findOne({
    where: whereModalidad,
    include,

    order: incluirReglas
      ? [
        [
          {
            model: OcurrenciaModalidadRegla,
            as: 'reglas',
          },
          'id',
          'ASC',
        ],
      ]
      : undefined,
  });
};

module.exports = getModalidadByCodigo;