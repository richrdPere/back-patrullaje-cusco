// models/persona.model.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Persona = sequelize.define("Persona", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombres: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  apellidos: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  documento_identidad: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  telefono: {
    type: DataTypes.STRING(20)
  },
  direccion: {
    type: DataTypes.STRING(150)
  },

  departamento: {
    type: DataTypes.STRING(100)
  },
  provincia: {
    type: DataTypes.STRING(100)
  },
  distrito: {
    type: DataTypes.STRING(100)
  },

  foto_perfil: {
    type: DataTypes.STRING(255)
  }
}, {
  tableName: "personas",
  timestamps: true
});

module.exports = Persona;