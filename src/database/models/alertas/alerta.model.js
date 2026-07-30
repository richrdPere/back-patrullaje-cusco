const { DataTypes } = require("sequelize");
const sequelize = require("../../../config/database");

const Alerta = sequelize.define(
  "Alerta",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    // Usuario que genera o envía la alerta.
    // Puede ser un sereno, supervisor, operador o administrador.
    emisor_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      // references: {
      //   model: "usuarios",
      //   key: "id",
      // },
    },

    // Patrullaje relacionado, si corresponde.
    patrullaje_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      // references: {
      //   model: "patrullajes_programados", 
      //   key: "id",
      // },
    },

    // Zona relacionada con la alerta.
    zona_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "zonas",
        key: "id",
      },
    },

    // Incidencia relacionada, si la alerta se genera a partir de una.
    incidencia_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "incidencias",
        key: "id",
      },
    },

    titulo: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },

    tipo: {
      type: DataTypes.ENUM(
        // Alertas generadas desde la aplicación móvil.
        "PANICO",
        "INCIDENCIA",
        "EMERGENCIA",
        "SOS",

        // Alertas enviadas desde la central.
        "INFORMATIVA",
        "PREVENTIVA",
        "CAMBIO_RUTA",
        "APOYO_REQUERIDO",
        "MENSAJE_CENTRAL"
      ),
      allowNull: false,
    },

    prioridad: {
      type: DataTypes.ENUM(
        "BAJA",
        "MEDIA",
        "ALTA",
        "CRITICA"
      ),
      allowNull: false,
      defaultValue: "MEDIA",
    },

    descripcion: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    latitud: {
      type: DataTypes.DECIMAL(10, 8),
      allowNull: true,
    },

    longitud: {
      type: DataTypes.DECIMAL(11, 8),
      allowNull: true,
    },

    // Indica si el sereno debe aceptar o rechazar la alerta.
    requiere_confirmacion: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },

    // Permite invalidar alertas temporales.
    fecha_expiracion: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    estado: {
      type: DataTypes.ENUM(
        "PENDIENTE",
        "EN_ATENCION",
        "ATENDIDA",
        "CANCELADA",
        "EXPIRADA"
      ),
      allowNull: false,
      defaultValue: "PENDIENTE",
    },
  },
  {
    tableName: "alertas",
    timestamps: true,
    indexes: [
      {
        fields: ["emisor_id"],
      },
      {
        fields: ["patrullaje_id"],
      },
      {
        fields: ["zona_id"],
      },
      {
        fields: ["incidencia_id"],
      },
      {
        fields: ["estado"],
      },
      {
        fields: ["prioridad"],
      },
      {
        fields: ["createdAt"],
      },
    ],
  }
);

module.exports = Alerta;