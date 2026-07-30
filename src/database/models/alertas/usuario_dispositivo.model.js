const { DataTypes } = require("sequelize");
const sequelize = require("../../../config/database");

const UsuarioDispositivo = sequelize.define(
  "UsuarioDispositivo",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    usuario_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    token_fcm: {
      type: DataTypes.STRING(512),
      allowNull: false,
      unique: true,
    },

    device_id: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },

    plataforma: {
      type: DataTypes.ENUM(
        "ANDROID",
        "IOS",
        "WEB"
      ),
      allowNull: false,
      defaultValue: "ANDROID",
    },

    activo: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },

    fecha_ultimo_acceso: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "usuarios_dispositivos",
    timestamps: true,
    indexes: [
      {
        fields: ["usuario_id"],
      },
      {
        fields: ["activo"],
      },
      {
        unique: true,
        fields: ["token_fcm"],
      },
      {
        fields: ["device_id"],
      },
    ],
  }
);

module.exports = UsuarioDispositivo;