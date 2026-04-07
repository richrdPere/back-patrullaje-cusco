const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Policia = sequelize.define("Policia", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },

  usuario_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true, // 1 a 1
  },

  grado: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },

  comisaria: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },

  codigo_institucional: {
    type: DataTypes.STRING(50),
    allowNull: true,
  }

}, {
  tableName: "policias",
  timestamps: false,
});

module.exports = Policia;
