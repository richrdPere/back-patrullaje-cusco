const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const PatrullajeProgramado = require("./patrullaje_programado.model");

const PatrullajeGps = sequelize.define("PatrullajeGps", {

  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },

  patrullaje_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: PatrullajeProgramado,
      key: "id"
    },
    onDelete: "CASCADE"
  },

  latitud: {
    type: DataTypes.DECIMAL(10, 7),
    allowNull: false,
  },

  longitud: {
    type: DataTypes.DECIMAL(10, 7),
    allowNull: false,
  },

  velocidad: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },

  precision: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },

  fecha_hora: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },

  tipo: {
    type: DataTypes.ENUM('TRACKING', 'EMERGENCIA', 'MANUAL'),
    defaultValue: 'TRACKING'
  }

}, {
  tableName: "patrullaje_gps",
  timestamps: true,
  indexes: [
    { fields: ['patrullaje_id'] },
    { fields: ['fecha_hora'] }
  ]
});

module.exports = PatrullajeGps;