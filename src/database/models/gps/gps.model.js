const { DataTypes } = require("sequelize");
const sequelize = require("../../config/database");
const Usuario = require("../auth/usuario.model");

const Gps = sequelize.define("Gps", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },

  usuario_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Usuario,
      key: "id"
    },
    onDelete: "CASCADE"
  },

  latitud: {
    type: DataTypes.DECIMAL(10, 7),
    allowNull: false,
  },

  longitud: {
    type: DataTypes.DECIMAL(10, 7),
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

  tipo: {
    type: DataTypes.ENUM('TRACKING', 'EMERGENCIA', 'MANUAL'),
    defaultValue: 'TRACKING'
  }


}, {
  tableName: "gps_registros",
  timestamps: true,
});



module.exports = Gps;
