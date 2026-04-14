const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Incidencia = sequelize.define("Incidencia", {

    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },

    usuario_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },

    patrullaje_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },

    tipo: {
        type: DataTypes.ENUM(
            "ROBO",
            "ACCIDENTE",
            "INCENDIO",
            "VIOLENCIA",
            "SOSPECHOSO",
            "OTRO"
        ),
        defaultValue: "OTRO"
    },

    descripcion: {
        type: DataTypes.TEXT,
        allowNull: false,
    },

    latitud: {
        type: DataTypes.DECIMAL(10, 7),
        allowNull: false,
    },

    longitud: {
        type: DataTypes.DECIMAL(10, 7),
        allowNull: false,
    },

    fecha_hora: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },

    estado: {
        type: DataTypes.ENUM(
            "REPORTADO",
            "EN_PROCESO",
            "ATENDIDO",
            "CERRADO"
        ),
        defaultValue: "REPORTADO"
    }

}, {
    tableName: "incidencias",
    timestamps: true,
});

module.exports = Incidencia;
