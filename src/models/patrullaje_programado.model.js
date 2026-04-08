const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const PatrullajeProgramado = sequelize.define("PatrullajeProgramado", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },

  unidad_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },

  zona_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },

  fecha: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },

  hora_inicio: {
    type: DataTypes.TIME,
    allowNull: false
  },

  hora_fin: {
    type: DataTypes.TIME,
    allowNull: false
  },

  estado: {
    type: DataTypes.ENUM(
      "PROGRAMADO",
      "EN_CURSO",
      "FINALIZADO"
    ),
    defaultValue: "PROGRAMADO"
  },

  descripcion: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: "patrullajes",
  timestamps: true,
});

module.exports = PatrullajeProgramado;
