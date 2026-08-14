// models/ocurrencias/OcurrenciaCorrelativo.js

const { DataTypes } = require('sequelize');
const sequelize = require('../../../config/database');

const OcurrenciaCorrelativo = sequelize.define('OcurrenciaCorrelativo', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },

  anio: {
    type: DataTypes.SMALLINT.UNSIGNED,
    allowNull: false,
    unique: true,

    validate: {
      min: {
        args: [2000],
        msg: 'El año del correlativo no es válido.',
      },

      max: {
        args: [9999],
        msg: 'El año del correlativo no es válido.',
      },
    },
  },

  ultimo_numero: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    defaultValue: 0,

    validate: {
      min: {
        args: [0],
        msg: 'El último número no puede ser negativo.',
      },

      max: {
        args: [999999],
        msg: 'El correlativo anual no puede superar 999999.',
      },
    },
  },
},
  {
    tableName: 'ocurrencia_correlativos',
    timestamps: true,
    underscored: true,

    indexes: [
      {
        name: 'uq_ocurrencia_correlativo_anio',
        unique: true,
        fields: ['anio'],
      },
    ],
  },
);

module.exports = OcurrenciaCorrelativo;