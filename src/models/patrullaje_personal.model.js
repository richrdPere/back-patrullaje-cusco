const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

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

    tipo_personal: {
        type: DataTypes.ENUM("SERENO", "POLICIA"),
        allowNull: false,
    },

    personal_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    }

}, {
    tableName: "patrullaje_personal",
    timestamps: false,
});

module.exports = PatrullajePersonal;