// models/ocurrencias/OcurrenciaPersona.js

const { DataTypes } = require('sequelize');
const sequelize = require('../../../config/database');

const OcurrenciaPersona = sequelize.define(
  'OcurrenciaPersona',
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },

    ocurrencia_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },

    /*
     * Permite ordenar visualmente las personas:
     * 1, 2, 3...
     */
    orden: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 1,

      validate: {
        min: {
          args: [1],
          msg: 'El orden debe ser mayor o igual a 1.',
        },
      },
    },

    tipo_persona: {
      type: DataTypes.ENUM(
        'AUTOR',
        'AGRESOR',
        'CONDUCTOR',
        'VICTIMA',
        'BENEFICIARIO',
      ),
      allowNull: false,
    },

    /*
     * Indica si se conoce la identidad de la persona.
     */
    identificado: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },

    documento_identidad: {
      type: DataTypes.STRING(20),
      allowNull: true,

      validate: {
        len: {
          args: [0, 20],
          msg: 'El documento de identidad no puede superar los 20 caracteres.',
        },
      },
    },

    /*
     * El formato oficial utiliza un único campo:
     * "Apellidos y nombres".
     *
     * También puede contener valores como:
     * "CONSULTA SUNARP".
     */
    nombres_apellidos: {
      type: DataTypes.STRING(250),
      allowNull: true,

      validate: {
        len: {
          args: [0, 250],
          msg: 'Los nombres y apellidos no pueden superar los 250 caracteres.',
        },
      },
    },

    genero: {
      type: DataTypes.ENUM(
        'MASCULINO',
        'FEMENINO',
        'NO_DETERMINADO',
      ),
      allowNull: true,
    },

    edad: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,

      validate: {
        min: {
          args: [0],
          msg: 'La edad no puede ser menor que cero.',
        },

        max: {
          args: [130],
          msg: 'La edad no puede ser mayor que 130.',
        },
      },
    },

    /*
     * Indica si la edad registrada es exacta
     * o solamente aproximada.
     */
    edad_es_aproximada: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },

    /*
     * Principalmente usado para CONDUCTOR.
     */
    placa: {
      type: DataTypes.STRING(20),
      allowNull: true,

      validate: {
        len: {
          args: [0, 20],
          msg: 'La placa no puede superar los 20 caracteres.',
        },
      },
    },

    /*
     * Se usa cuando no se conoce la identidad
     * o para registrar características de la víctima.
     */
    caracteristicas_fisicas: {
      type: DataTypes.STRING(500),
      allowNull: true,

      validate: {
        len: {
          args: [0, 500],
          msg: 'Las características físicas no pueden superar los 500 caracteres.',
        },
      },
    },

    /*
     * El formato permite registrar a la comunidad
     * como víctima o beneficiaria.
     */
    es_comunidad: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },

    fuente_datos: {
      type: DataTypes.ENUM(
        'DIRECTA',
        'REFERENCIAL',
        'CONSULTA_SUNARP',
        'COMUNIDAD',
      ),
      allowNull: false,
      defaultValue: 'DIRECTA',
    },

    observacion: {
      type: DataTypes.STRING(500),
      allowNull: true,

      validate: {
        len: {
          args: [0, 500],
          msg: 'La observación no puede superar los 500 caracteres.',
        },
      },
    },

    estado: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    tableName: 'ocurrencia_personas',
    timestamps: true,
    underscored: true,

    indexes: [
      {
        name: 'idx_ocu_persona_ocurrencia',
        fields: ['ocurrencia_id'],
      },
      {
        name: 'idx_ocu_persona_tipo',
        fields: ['tipo_persona'],
      },
      {
        name: 'idx_ocu_persona_documento',
        fields: ['documento_identidad'],
      },
      {
        name: 'idx_ocu_persona_genero',
        fields: ['genero'],
      },
      {
        name: 'idx_ocu_persona_estado',
        fields: ['estado'],
      },
      {
        name: 'idx_ocu_persona_ocurrencia_tipo',
        fields: [
          'ocurrencia_id',
          'tipo_persona',
        ],
      },
    ],

    validate: {
      validarComunidad() {
        if (!this.es_comunidad) {
          return;
        }

        const tiposPermitidos = [
          'VICTIMA',
          'BENEFICIARIO',
        ];

        if (
          !tiposPermitidos.includes(
            this.tipo_persona,
          )
        ) {
          throw new Error(
            'La comunidad solo puede registrarse como víctima o beneficiaria.',
          );
        }
      },

      validarFuenteComunidad() {
        if (
          this.fuente_datos === 'COMUNIDAD' &&
          !this.es_comunidad
        ) {
          throw new Error(
            'Debe marcar es_comunidad cuando la fuente de datos sea COMUNIDAD.',
          );
        }

        if (
          this.es_comunidad &&
          this.fuente_datos !== 'COMUNIDAD'
        ) {
          throw new Error(
            'La fuente de datos debe ser COMUNIDAD cuando se registra una víctima o beneficiaria colectiva.',
          );
        }
      },

      validarConsultaSunarp() {
        if (
          this.fuente_datos ===
          'CONSULTA_SUNARP' &&
          this.tipo_persona !== 'CONDUCTOR'
        ) {
          throw new Error(
            'La fuente CONSULTA_SUNARP solo puede utilizarse para conductores.',
          );
        }
      },

      validarEdadAproximada() {
        if (
          this.edad_es_aproximada &&
          (
            this.edad === null ||
            this.edad === undefined
          )
        ) {
          throw new Error(
            'Debe ingresar una edad cuando se indique que es aproximada.',
          );
        }
      },
    },
  },
);

module.exports = OcurrenciaPersona;