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

  // URL pública
  url_archivo: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  // CLAVE S3 (MUY IMPORTANTE)
  key_s3: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  // Tipo simplificado (para UI)
  tipo_archivo: {
    type: DataTypes.ENUM("IMAGEN", "VIDEO", "PDF", "OTRO"),
    allowNull: false,
  },

  // Tipo real
  mime_type: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  // Tamaño archivo
  peso: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: "Peso en bytes"
  },

  // Quién subió (sereno)
  sereno_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

  // Estado lógico
  estado: {
    type: DataTypes.ENUM("ACTIVO", "ELIMINADO"),
    defaultValue: "ACTIVO"
  }

}, {
  tableName: "incidencia_archivos",
  timestamps: true,
});

module.exports = IncidenciaArchivo;