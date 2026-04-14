const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const IncidenciaArchivo = sequelize.define("IncidenciaArchivo", {

  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },

  incidencia_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

  url_archivo: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  tipo_archivo: {
    type: DataTypes.ENUM("IMAGEN", "VIDEO"),
    allowNull: false,
  }

}, {
  tableName: "incidencia_archivos",
  timestamps: true,
});

module.exports = IncidenciaArchivo;