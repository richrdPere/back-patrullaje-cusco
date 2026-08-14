// models/ocurrencias/OcurrenciaEfectivoPnp.js

const { DataTypes } = require('sequelize');
const sequelize = require('../../../config/database');

const OcurrenciaEfectivoPnp = sequelize.define('OcurrenciaEfectivoPnp', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },

  ocurrencia_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
  },

  policia_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },

  apellidos: {
    type: DataTypes.STRING(150),
    allowNull: true,

    validate: {
      len: {
        args: [0, 150],
        msg: 'Los apellidos no pueden superar los 150 caracteres.',
      },
    },
  },

  nombres: {
    type: DataTypes.STRING(150),
    allowNull: true,

    validate: {
      len: {
        args: [0, 150],
        msg: 'Los nombres no pueden superar los 150 caracteres.',
      },
    },
  },

  grado: {
    type: DataTypes.STRING(50),
    allowNull: true,

    validate: {
      len: {
        args: [0, 50],
        msg: 'El grado no puede superar los 50 caracteres.',
      },
    },
  },

  comisaria: {
    type: DataTypes.STRING(100),
    allowNull: true,

    validate: {
      len: {
        args: [0, 100],
        msg: 'La comisaría no puede superar los 100 caracteres.',
      },
    },
  },

  codigo_institucional: {
    type: DataTypes.STRING(50),
    allowNull: true,

    validate: {
      len: {
        args: [0, 50],
        msg: 'El código institucional no puede superar los 50 caracteres.',
      },
    },
  },

  fuente_registro: {
    type: DataTypes.ENUM(
      'CATALOGO',
      'MANUAL',
    ),
    allowNull: false,
    defaultValue: 'MANUAL',
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

  tipo_participacion: {
    type: DataTypes.ENUM(
      'PATRULLAJE_INTEGRADO',
      'APOYO',
      'INTERVENCION',
      'TRASLADO',
      'OTRO',
    ),
    allowNull: false,
    defaultValue: 'APOYO',
  },

  tipo_participacion_otro: {
    type: DataTypes.STRING(250),
    allowNull: true,

    validate: {
      len: {
        args: [0, 250],
        msg: 'El otro tipo de participación no puede superar los 250 caracteres.',
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
    tableName: 'ocurrencia_efectivos_pnp',
    timestamps: true,
    underscored: true,

    indexes: [
      {
        name: 'idx_ocu_efectivo_ocurrencia',
        fields: ['ocurrencia_id'],
      },
      {
        name: 'idx_ocu_efectivo_policia',
        fields: ['policia_id'],
      },
      {
        name: 'idx_ocu_efectivo_estado',
        fields: ['estado'],
      },
      {
        name: 'uq_ocu_efectivo_ocurrencia_policia',
        unique: true,
        fields: [
          'ocurrencia_id',
          'policia_id',
        ],
      },
    ],

    validate: {
      validarIdentificacionEfectivo() {
        const tienePoliciaId =
          this.policia_id !== null &&
          this.policia_id !== undefined;

        const tieneApellidos =
          Boolean(String(this.apellidos || '').trim());

        const tieneNombres =
          Boolean(String(this.nombres || '').trim());

        if (
          !tienePoliciaId &&
          (!tieneApellidos || !tieneNombres)
        ) {
          throw new Error(
            'Debe seleccionar un policía registrado o ingresar manualmente sus nombres y apellidos.',
          );
        }
      },

      validarFuenteRegistro() {
        if (
          this.fuente_registro === 'CATALOGO' &&
          (
            this.policia_id === null ||
            this.policia_id === undefined
          )
        ) {
          throw new Error(
            'El policía es obligatorio cuando la fuente del registro es CATÁLOGO.',
          );
        }
      },

      validarTipoParticipacionOtro() {
        if (
          this.tipo_participacion === 'OTRO' &&
          !String(
            this.tipo_participacion_otro || '',
          ).trim()
        ) {
          throw new Error(
            'Debe especificar el tipo de participación cuando seleccione OTRO.',
          );
        }
      },
    },
  },
);

module.exports = OcurrenciaEfectivoPnp;