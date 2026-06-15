const { DataTypes } = require("sequelize");
const sequelize = require("../../config/database");

const Mensaje = sequelize.define("Mensaje", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },

  conversacion_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

  usuario_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

  tipo: {
    type: DataTypes.ENUM(
      "texto",
      "imagen",
      "audio",
      "video",
      "archivo",
      "ubicacion",
      "incidente",
      "alerta"
    ),
    defaultValue: "texto",
  },

  mensaje: {
    type: DataTypes.TEXT,
    allowNull: true,
  },

  archivo_url: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },

  archivo_key: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },

  latitud: {
    type: DataTypes.DECIMAL(10, 8),
    allowNull: true,
  },

  longitud: {
    type: DataTypes.DECIMAL(11, 8),
    allowNull: true,
  },

  estado: {
    type: DataTypes.ENUM(
      "enviado",
      "entregado",
      "leido"
    ),
    defaultValue: "enviado",
  },

  eliminado: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },

}, {
  tableName: "mensajes",
  timestamps: true,
});

module.exports = Mensaje;