const db = require('../../../../database/models');

// Modelos
const {
  Usuario,
  Persona,
  Incidencia,
  PatrullajeProgramado,
  Zonas,
  UnidadPatrullaje,
  Ocurrencia,
  OcurrenciaClasificadorVersion,
  OcurrenciaCategoriaGenerica,
  OcurrenciaCategoriaEspecifica,
  OcurrenciaModalidad,
  OcurrenciaModalidadRegla,
  OcurrenciaPersona,
  OcurrenciaConsecuencia,
  OcurrenciaMedioEmpleado,
  OcurrenciaEfectivoPnp,
  OcurrenciaHistorial,
} = db;

// SERVICES
const getOcurrenciaById = async (ocurrenciaId, { transaction = null, } = {}) => {

  const modelosIncluidos = {
    Usuario,
    Persona,
    Incidencia,
    PatrullajeProgramado,
    Zonas,
    UnidadPatrullaje,
    Ocurrencia,
    OcurrenciaClasificadorVersion,
    OcurrenciaCategoriaGenerica,
    OcurrenciaCategoriaEspecifica,
    OcurrenciaModalidad,
    OcurrenciaModalidadRegla,
    OcurrenciaPersona,
    OcurrenciaConsecuencia,
    OcurrenciaMedioEmpleado,
    OcurrenciaEfectivoPnp,
    OcurrenciaHistorial,
  };

  console.log(
    'Modelos no encontrados:',
    Object.entries(modelosIncluidos)
      .filter(([, modelo]) => !modelo)
      .map(([nombre]) => nombre),
  );

  console.log({
    asociacionSerenoExiste:
      Boolean(Ocurrencia.associations.sereno),

    mismoModeloUsuario:
      Ocurrencia.associations.sereno?.target === Usuario,

    usuarioConsulta:
      Usuario?.name,

    usuarioAsociacion:
      Ocurrencia.associations.sereno?.target?.name,
  });



  return Ocurrencia.findByPk(
    ocurrenciaId,
    {
      include: [
        {
          model: Usuario,
          as: 'sereno',
          attributes: [
            'id',
            'persona_id',
          ],

          include: Persona
            ? [
              {
                model: Persona,
                as: 'persona',
                attributes: [
                  'id',
                  'nombres',
                  'apellidos',
                  'documento_identidad',
                ],
              },
            ]
            : [],
        },

        {
          model: OcurrenciaModalidad,
          as: 'modalidad',

          include: [
            {
              model:
                OcurrenciaCategoriaEspecifica,
              as: 'categoria_especifica',

              include: [
                {
                  model:
                    OcurrenciaCategoriaGenerica,
                  as: 'categoria_generica',

                  include: [
                    {
                      model:
                        OcurrenciaClasificadorVersion,
                      as: 'version',
                    },
                  ],
                },
              ],
            },

            {
              model: OcurrenciaModalidadRegla,
              as: 'reglas',
              required: false,

              where: {
                estado: true,
              },
            },
          ],
        },

        {
          model: Incidencia,
          as: 'incidencia',
          required: false,
        },

        {
          model: PatrullajeProgramado,
          as: 'patrullaje',
          required: false,
        },

        {
          model: Zonas,
          as: 'zonas',
          required: false,
        },

        {
          model: UnidadPatrullaje,
          as: 'unidad',
          required: false,
        },

        {
          model: OcurrenciaPersona,
          as: 'personas',
          required: false,
        },

        {
          model: OcurrenciaConsecuencia,
          as: 'consecuencias',
          required: false,
        },

        {
          model: OcurrenciaMedioEmpleado,
          as: 'medios_empleados',
          required: false,
        },

        {
          model: OcurrenciaEfectivoPnp,
          as: 'efectivos_pnp',
          required: false,
        },

        {
          model: OcurrenciaHistorial,
          as: 'historial',
          required: false,
        },
      ],

      transaction,

      order: [
        [
          {
            model: OcurrenciaHistorial,
            as: 'historial',
          },
          'created_at',
          'ASC',
        ],
      ],
    },
  );
};

module.exports = getOcurrenciaById;