const { DataTypes } = require("sequelize");
const sequelize = require("../../../config/database");

const OcurrenciaClasificadorVersion = sequelize.define('OcurrenciaClasificadorVersion', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },

  nombre: {
    type: DataTypes.STRING(150),
    allowNull: false,
  },

  resolucion: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },

  descripcion: {
    type: DataTypes.TEXT,
    allowNull: true,
  },

  fecha_publicacion: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },

  vigencia_desde: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },

  vigencia_hasta: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },

  estado: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
},
  {
    tableName: 'ocurrencia_clasificador_versiones',
    timestamps: true,
    underscored: true,
  },
);



module.exports = OcurrenciaClasificadorVersion;

