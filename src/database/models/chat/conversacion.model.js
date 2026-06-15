const { DataTypes } = require("sequelize");
const sequelize = require("../../config/database");

const Conversacion = sequelize.define("Conversacion", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },

  tipo: {
    type: DataTypes.ENUM(
      "privado",
      "grupal",
      "incidente",
      "emergencia"
    ),
    allowNull: false,
    defaultValue: "privado",
  },

  nombre: {
    type: DataTypes.STRING(150),
    allowNull: true,
  },

  descripcion: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },

  foto: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },

  estado: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },

}, {
  tableName: "conversaciones",
  timestamps: true,
});

module.exports = Conversacion;