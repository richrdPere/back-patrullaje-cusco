
const { DataTypes } = require("sequelize");
const sequelize = require("../../../config/database");

const OcurrenciaCategoriaGenerica = sequelize.define(
    'OcurrenciaCategoriaGenerica',
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },

      version_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
      },

      codigo: {
        type: DataTypes.STRING(2),
        allowNull: false,
        validate: {
          is: /^\d{2}$/,
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
      tableName: 'ocurrencia_categorias_genericas',
      timestamps: true,
      underscored: true,
    },
  );

module.exports = OcurrenciaCategoriaGenerica;

