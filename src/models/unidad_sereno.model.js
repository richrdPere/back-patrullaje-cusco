const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const UnidadSereno = sequelize.define("UnidadSereno", {

    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },

    unidad_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },

    usuario_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    }

}, {
    tableName: "unidad_sereno",
    timestamps: true
});

module.exports = UnidadSereno;