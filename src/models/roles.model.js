const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Roles = sequelize.define("Roles", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  nombre: {
    type: DataTypes.STRING(50),
    unique: true,
    allowNull: false,
  },
}, {
  tableName: "roles",
  timestamps: false,
});

module.exports = Roles;