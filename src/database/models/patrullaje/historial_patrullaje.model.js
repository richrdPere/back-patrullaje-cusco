const { DataTypes } = require("sequelize");
const sequelize = require("../../config/database");

const HistorialPatrullaje = sequelize.define("HistorialPatrullaje", {

  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },

  patrullaje_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

  sereno_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

  zona_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

  tipo: {
    type: DataTypes.ENUM(
      "OBSERVACION",
      "NOVEDAD",
      "ALERTA",
      "RECOMENDACION",
      "PUNTO_CRITICO",
      "CAMBIO_TURNO"
    ),
    defaultValue: "OBSERVACION"
  },

  titulo: {
    type: DataTypes.STRING(150),
    allowNull: false,
  },

  descripcion: {
    type: DataTypes.TEXT,
    allowNull: false,
  },

  prioridad: {
    type: DataTypes.ENUM(
      "BAJA",
      "MEDIA",
      "ALTA",
      "CRITICA"
    ),
    defaultValue: "MEDIA"
  },

  latitud: {
    type: DataTypes.DECIMAL(10, 7),
    allowNull: true,
  },

  longitud: {
    type: DataTypes.DECIMAL(10, 7),
    allowNull: true,
  },

  visible_para_siguiente_turno: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },

  fecha_hora: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },

  estado: {
    type: DataTypes.ENUM(
      "ACTIVO",
      "ARCHIVADO"
    ),
    defaultValue: "ACTIVO"
  }

}, {
  tableName: "historial_patrullajes",
  timestamps: true,
});

module.exports = HistorialPatrullaje;