// models/ocurrencias/OcurrenciaMedioEmpleado.js

const { DataTypes } = require('sequelize');
const sequelize = require('../../../config/database');

const OcurrenciaMedioEmpleado = sequelize.define('OcurrenciaMedioEmpleado', {
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
      'ARMA_DE_FUEGO',
      'ARMA_BLANCA',
      'AGRESION',
      'AMENAZA',
      'FUERZA',
      'ENGANO',
      'HABILIDAD',
      'OTRO',
    ),
    allowNull: false,
  },

  /*
   * Permite especificar información adicional.
   *
   * Ejemplos:
   * - Tipo o características del arma.
   * - Descripción de la amenaza.
   * - Medio utilizado cuando se selecciona OTRO.
   */
  descripcion: {
    type: DataTypes.STRING(500),
    allowNull: true,

    validate: {
      len: {
        args: [0, 500],
        msg: 'La descripción del medio empleado no puede superar los 500 caracteres.',
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
    tableName: 'ocurrencia_medios_empleados',
    timestamps: true,
    underscored: true,

    indexes: [
      {
        name: 'idx_ocu_medio_ocurrencia',
        fields: ['ocurrencia_id'],
      },
      {
        name: 'idx_ocu_medio_tipo',
        fields: ['tipo'],
      },
      {
        name: 'idx_ocu_medio_estado',
        fields: ['estado'],
      },
      {
        name: 'uq_ocu_medio_ocurrencia_tipo',
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
            'La descripción es obligatoria cuando el medio empleado es OTRO.',
          );
        }
      },
    },
  },
);

module.exports = OcurrenciaMedioEmpleado;