const { DataTypes } = require("sequelize");
const sequelize = require("../../../config/database");

const AlertaDestinatario = sequelize.define(
  "AlertaDestinatario",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    alerta_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "alertas",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },

    usuario_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "usuarios",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },

    estado: {
      type: DataTypes.ENUM(
        "PENDIENTE",
        "RECIBIDA",
        "LEIDA",
        "ACEPTADA",
        "RECHAZADA",
        "ATENDIDA"
      ),
      allowNull: false,
      defaultValue: "PENDIENTE",
    },

    fecha_recibida: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    fecha_leida: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    fecha_respuesta: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    fecha_atendida: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    observacion: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "alerta_destinatarios",
    timestamps: true,

    indexes: [
      {
        unique: true,
        fields: ["alerta_id", "usuario_id"],
        name: "uk_alerta_destinatario",
      },
      {
        fields: ["usuario_id", "estado"],
        name: "idx_destinatario_estado",
      },
      {
        fields: ["alerta_id"],
      },
    ],
  }
);

module.exports = AlertaDestinatario;