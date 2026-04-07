const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Alerta = sequelize.define(
  "Alerta",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    tipo: {
      type: DataTypes.ENUM(
        "PANICO",
        "INCIDENCIA",
        "EMERGENCIA",
        "SOS"
      ),
      allowNull: false,
    },

    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    latitud: {
      type: DataTypes.DECIMAL(10, 8),
      allowNull: false,
    },

    longitud: {
      type: DataTypes.DECIMAL(11, 8),
      allowNull: false,
    },

    estado: {
      type: DataTypes.ENUM(
        "PENDIENTE",
        "EN_ATENCION",
        "ATENDIDA",
        "CANCELADA"
      ),
      defaultValue: "PENDIENTE",
    },
  },
  {
    tableName: "alertas",
    timestamps: true,
  }
);

module.exports = Alerta;
