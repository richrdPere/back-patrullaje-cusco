const { DataTypes } = require("sequelize");
const sequelize = require("../../../config/database");

const PatrullajeResumen = sequelize.define("PatrullajeResumen", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },

    patrullaje_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
    },

    usuario_finaliza_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },

    fecha_inicio: {
        type: DataTypes.DATE,
        allowNull: false,
    },

    fecha_fin: {
        type: DataTypes.DATE,
        allowNull: false,
    },

    duracion_segundos: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },

    distancia_total_metros: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0,
    },

    total_puntos_recorrido: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },

    total_incidencias: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },

    total_observaciones: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },

    observacion_final: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
},
    {
        tableName: "patrullaje_resumen",
        timestamps: true,
        underscored: true,
    },
);

module.exports = PatrullajeResumen;