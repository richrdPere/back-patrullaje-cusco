const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Usuario = sequelize.define("Usuario", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  nombre: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  apellidos: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  username: {
    type: DataTypes.STRING(100),
    allowNull: true,
    unique: true,
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  correo: {
    type: DataTypes.STRING(100),
    allowNull: true,
    unique: true,
  },
  telefono: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  documento_identidad: {
    type: DataTypes.STRING(20),
    allowNull: false,
    // unique: true,
  },
  direccion: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  departamento: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  provincia: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  distrito: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  estado: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  foto_perfil: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  online: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  }
}, {
  tableName: "usuarios",
  timestamps: true,
});

module.exports = Usuario;
