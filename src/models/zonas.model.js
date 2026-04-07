const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Zonas = sequelize.define(
  "Zonas",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    nombre: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    descripcion: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    coordenadas: {
      type: DataTypes.JSON,
      allowNull: false,
      comment: "Coordenadas del polígono de la zona",
    },
    riesgo: {
      type: DataTypes.ENUM("bajo", "medio", "alto", "critico"),
      defaultValue: "medio",
    },
    estado: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: "zonas",
    timestamps: true, // createdAt, updatedAt
  }
);

module.exports = Zonas;
