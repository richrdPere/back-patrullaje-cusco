// models/ocurrencias/OcurrenciaCategoriaEspecifica.js

const { DataTypes } = require("sequelize");
const sequelize = require("../../../config/database");

const OcurrenciaCategoriaEspecifica = sequelize.define(
  'OcurrenciaCategoriaEspecifica',
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },

    categoria_generica_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },

    codigo: {
      type: DataTypes.STRING(4),
      allowNull: false,
      validate: {
        is: /^\d{4}$/,
      },
    },

    nombre: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },

    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    orden: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
    },

    estado: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    tableName: 'ocurrencia_categorias_especificas',
    timestamps: true,
    underscored: true,
  },
);

module.exports = OcurrenciaCategoriaEspecifica;


