const { DataTypes } = require("sequelize");
const sequelize = require("../../../config/database");

const OcurrenciaModalidadRegla = sequelize.define(
  'OcurrenciaModalidadRegla',
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },

    modalidad_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },

    clave: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },

    descripcion: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },

    parametros: {
      type: DataTypes.JSON,
      allowNull: true,
    },

    estado: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    tableName: 'ocurrencia_modalidad_reglas',
    timestamps: true,
    underscored: true,
  },
);

module.exports = OcurrenciaModalidadRegla;


