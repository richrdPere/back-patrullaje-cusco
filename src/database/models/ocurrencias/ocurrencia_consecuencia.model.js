// models/ocurrencias/OcurrenciaConsecuencia.js

const { DataTypes } = require('sequelize');
const sequelize = require('../../../config/database');

const OcurrenciaConsecuencia = sequelize.define('OcurrenciaConsecuencia', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },

  ocurrencia_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
  },

  tipo: {
    type: DataTypes.ENUM(
      'MATERIALES',
      'PERSONALES',
      'PSICOLOGICAS',
      'MUERTE',
      'DESORDEN',
      'OCUPACION_INDEBIDA_ESPACIOS_PUBLICOS',
      'PAZ_Y_ORDEN',
      'ACCIONES_DISUASIVAS_PREVENTIVAS',
      'OTRO',
    ),
    allowNull: false,
  },

  descripcion: {
    type: DataTypes.STRING(500),
    allowNull: true,
    validate: {
      len: {
        args: [0, 500],
        msg: 'La descripción no puede superar los 500 caracteres.',
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
    tableName: 'ocurrencia_consecuencias',
    timestamps: true,
    underscored: true,

    indexes: [
      {
        name: 'idx_ocu_consecuencia_ocurrencia',
        fields: ['ocurrencia_id'],
      },
      {
        name: 'idx_ocu_consecuencia_tipo',
        fields: ['tipo'],
      },
      {
        name: 'idx_ocu_consecuencia_estado',
        fields: ['estado'],
      },
      {
        name: 'uq_ocu_consecuencia_ocurrencia_tipo',
        unique: true,
        fields: [
          'ocurrencia_id',
          'tipo',
        ],
      },
    ],

    validate: {
      validarDescripcionOtro() {
        if (
          this.tipo === 'OTRO' &&
          !String(this.descripcion || '').trim()
        ) {
          throw new Error(
            'La descripción es obligatoria cuando el tipo de consecuencia es OTRO.',
          );
        }
      },
    },
  },
);

module.exports = OcurrenciaConsecuencia;