const { DataTypes } = require("sequelize");
const sequelize = require("../../../config/database");


const OcurrenciaModalidad = sequelize.define(
    'OcurrenciaModalidad',
    {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey: true,
        },

        categoria_especifica_id: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
        },

        codigo: {
            type: DataTypes.STRING(6),
            allowNull: false,
            unique: true,
            validate: {
                is: /^\d{6}$/,
            },
        },

        nombre: {
            type: DataTypes.STRING(700),
            allowNull: false,
        },

        descripcion: {
            type: DataTypes.TEXT,
            allowNull: true,
        },

        requiere_autor: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },

        requiere_victima: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },

        requiere_conductor: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },

        requiere_datos_pnp: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },

        requiere_descripcion: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },

        orden: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            defaultValue: 0,
        },

        vigencia_desde: {
            type: DataTypes.DATEONLY,
            allowNull: true,
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
        tableName: 'ocurrencia_modalidades',
        timestamps: true,
        underscored: true,
    },
);

module.exports =OcurrenciaModalidad; 

