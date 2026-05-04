const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const UnidadPatrullaje = sequelize.define('UnidadPatrullaje', {

  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },

  codigo: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true
  },

  tipo: {
    type: DataTypes.STRING(50),
    allowNull: false
  },

  placa: {
    type: DataTypes.STRING(20),
    allowNull: true
  },

  estado: {
    type: DataTypes.ENUM(
      'DISPONIBLE',
      'EN_PATRULLAJE',
      'MANTENIMIENTO',
      'FUERA_DE_SERVICIO'
    ),
    defaultValue: 'DISPONIBLE'
  },

  descripcion: {
    type: DataTypes.TEXT,
    allowNull: true
  }

}, {
  tableName: 'unidades_patrullaje',
  timestamps: true
});

module.exports = UnidadPatrullaje;