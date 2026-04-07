const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Usuario = require("./usuario.model");

const Gps = sequelize.define("Gps", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },

  latitud: {
    type: DataTypes.DECIMAL(10, 8),
    allowNull: false,
  },

  longitud: {
    type: DataTypes.DECIMAL(11, 8),
    allowNull: false,
  },

  velocidad: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },

  precision: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },

  fecha_hora: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },

  estado: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  tableName: "gps_registros",
  timestamps: true,
});



module.exports = Gps;
