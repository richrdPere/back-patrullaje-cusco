const { DataTypes } = require("sequelize");
const sequelize = require("../../../config/database");

const PatrullajePersonal = sequelize.define("PatrullajePersonal", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },

    patrullaje_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },

    usuario_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: "Usuario asignado al patrullaje (sereno o policía)"
    },

    policia_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: "Policía asignado cuando el personal es un policía."
    },

    tipo_personal: {
        type: DataTypes.ENUM("SERENO", "POLICIA"),
        allowNull: false,
    },

    estado: {
        type: DataTypes.ENUM("ASIGNADO", "ACEPTADO", "RECHAZADO", "EN_SERVICIO", "FINALIZADO"),
        defaultValue: "ASIGNADO"
    },

    fecha_asignacion: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }

}, {
    tableName: "patrullaje_personal",
    timestamps: false,
});

module.exports = PatrullajePersonal;