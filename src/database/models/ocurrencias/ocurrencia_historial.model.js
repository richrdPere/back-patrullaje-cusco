// models/ocurrencias/OcurrenciaHistorial.js

const { DataTypes } = require('sequelize');
const sequelize = require('../../../config/database');

const ESTADOS_OCURRENCIA = [
  'BORRADOR',
  'REGISTRADA',
  'PENDIENTE_VALIDACION',
  'OBSERVADA',
  'VALIDADA',
  'CERRADA',
  'ANULADA',
];

const ACCIONES_OCURRENCIA = [
  'CREACION',
  'ACTUALIZACION',
  'CAMBIO_ESTADO',
  'ENVIO_VALIDACION',
  'OBSERVACION',
  'CORRECCION',
  'VALIDACION',
  'CIERRE',
  'ANULACION',
  'REAPERTURA',
  'REMISION',
];

const OcurrenciaHistorial = sequelize.define('OcurrenciaHistorial', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },

  ocurrencia_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
  },

  /*
   * Usuario que realizó la acción.
   * Puede ser el sereno, operador, supervisor
   * o administrador.
   */
  usuario_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

  accion: {
    type: DataTypes.ENUM(
      ...ACCIONES_OCURRENCIA,
    ),
    allowNull: false,
  },

  estado_anterior: {
    type: DataTypes.STRING(30),
    allowNull: true,

    validate: {
      estadoAnteriorValido(value) {
        if (
          value !== null &&
          value !== undefined &&
          !ESTADOS_OCURRENCIA.includes(value)
        ) {
          throw new Error(
            'El estado anterior de la ocurrencia no es válido.',
          );
        }
      },
    },
  },

  estado_nuevo: {
    type: DataTypes.STRING(30),
    allowNull: true,

    validate: {
      estadoNuevoValido(value) {
        if (
          value !== null &&
          value !== undefined &&
          !ESTADOS_OCURRENCIA.includes(value)
        ) {
          throw new Error(
            'El nuevo estado de la ocurrencia no es válido.',
          );
        }
      },
    },
  },

  /*
   * Explicación legible de la acción realizada.
   */
  comentario: {
    type: DataTypes.TEXT,
    allowNull: true,

    validate: {
      len: {
        args: [0, 2000],
        msg: 'El comentario no puede superar los 2000 caracteres.',
      },
    },
  },

  /*
   * Almacena los campos que fueron modificados.
   *
   * Ejemplo:
   * {
   *   "direccion": {
   *     "anterior": "Av. La Cultura",
   *     "nuevo": "Av. La Cultura 1200"
   *   }
   * }
   */
  datos_cambiados: {
    type: DataTypes.JSON,
    allowNull: true,
  },

  origen: {
    type: DataTypes.ENUM(
      'APP_MOVIL',
      'WEB',
      'BACKEND',
      'SISTEMA',
    ),
    allowNull: false,
    defaultValue: 'BACKEND',
  },

  direccion_ip: {
    type: DataTypes.STRING(45),
    allowNull: true,

    validate: {
      len: {
        args: [0, 45],
        msg: 'La dirección IP no puede superar los 45 caracteres.',
      },
    },
  },

  user_agent: {
    type: DataTypes.STRING(500),
    allowNull: true,

    validate: {
      len: {
        args: [0, 500],
        msg: 'El user agent no puede superar los 500 caracteres.',
      },
    },
  },
},
  {
    tableName: 'ocurrencia_historiales',

    /*
     * El historial solo necesita created_at.
     * No debe modificarse después de ser creado.
     */
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,

    underscored: true,

    indexes: [
      {
        name: 'idx_ocu_historial_ocurrencia',
        fields: ['ocurrencia_id'],
      },
      {
        name: 'idx_ocu_historial_usuario',
        fields: ['usuario_id'],
      },
      {
        name: 'idx_ocu_historial_accion',
        fields: ['accion'],
      },
      {
        name: 'idx_ocu_historial_fecha',
        fields: ['created_at'],
      },
      {
        name: 'idx_ocu_historial_ocurrencia_fecha',
        fields: [
          'ocurrencia_id',
          'created_at',
        ],
      },
    ],

    validate: {
      validarCambioEstado() {
        const accionesConCambioEstado = [
          'CREACION',
          'CAMBIO_ESTADO',
          'ENVIO_VALIDACION',
          'OBSERVACION',
          'VALIDACION',
          'CIERRE',
          'ANULACION',
          'REAPERTURA',
        ];

        if (
          accionesConCambioEstado.includes(
            this.accion,
          ) &&
          !this.estado_nuevo
        ) {
          throw new Error(
            `El nuevo estado es obligatorio para la acción ${this.accion}.`,
          );
        }
      },

      validarEstadoCreacion() {
        if (
          this.accion === 'CREACION' &&
          this.estado_anterior !== null &&
          this.estado_anterior !== undefined
        ) {
          throw new Error(
            'Una creación no debe tener estado anterior.',
          );
        }

        if (
          this.accion === 'CREACION' &&
          this.estado_nuevo !== 'BORRADOR'
        ) {
          throw new Error(
            'Una ocurrencia debe crearse inicialmente en estado BORRADOR.',
          );
        }
      },

      validarEstadosDiferentes() {
        if (
          this.accion !== 'CREACION' &&
          this.estado_anterior &&
          this.estado_nuevo &&
          this.estado_anterior ===
          this.estado_nuevo
        ) {
          throw new Error(
            'El estado anterior y el nuevo estado no pueden ser iguales.',
          );
        }
      },

      validarMotivoObligatorio() {
        const accionesConComentarioObligatorio = [
          'OBSERVACION',
          'ANULACION',
          'REAPERTURA',
        ];

        if (
          accionesConComentarioObligatorio.includes(
            this.accion,
          ) &&
          !String(this.comentario || '').trim()
        ) {
          throw new Error(
            `El comentario es obligatorio para la acción ${this.accion}.`,
          );
        }
      },
    },
  },
);

module.exports = OcurrenciaHistorial;