const { DataTypes } = require("sequelize");
const sequelize = require("../../../config/database");

const MensajeLectura = sequelize.define("MensajeLectura", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },

  mensaje_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

  usuario_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

  leido_en: {
    type: DataTypes.DATE,
    allowNull: true,
  },

}, {
  tableName: "mensaje_lecturas",
  timestamps: true,
});

module.exports = MensajeLectura;