const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const ConversacionParticipante = sequelize.define("ConversacionParticipante", {
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

  rol: {
    type: DataTypes.ENUM(
      "admin",
      "miembro"
    ),
    defaultValue: "miembro",
  },

  ultima_lectura: {
    type: DataTypes.DATE,
    allowNull: true,
  },

  silenciado: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },

  estado: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },

}, {
  tableName: "conversacion_participantes",
  timestamps: true,
});

module.exports = ConversacionParticipante;