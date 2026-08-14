// models/ocurrencias/Ocurrencia.js

const { DataTypes } = require('sequelize');
const sequelize = require('../../../config/database');

const Ocurrencia = sequelize.define(
  'Ocurrencia',
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },

    /*
     * Será generado por el requerimiento RF-BE-OC-03.
     *
     * Ejemplo:
     * OCU-2026-000001
     *
     * Puede ser null mientras la ocurrencia sea borrador.
     */
    numero_ocurrencia: {
      type: DataTypes.STRING(30),
      allowNull: true,
      unique: true,

      validate: {
        len: {
          args: [0, 30],
          msg: 'El número de ocurrencia no puede superar los 30 caracteres.',
        },

        formatoNumero(value) {
          if (
            value &&
            !/^OCU-\d{4}-\d{6}$/.test(value)
          ) {
            throw new Error(
              'El número de ocurrencia debe tener el formato OCU-AAAA-000000.',
            );
          }
        },
      },
    },

    /*
     * Identificador generado por Flutter para sincronización
     * offline e idempotencia.
     */
    uuid_cliente: {
      type: DataTypes.UUID,
      allowNull: true,
      unique: true,

      validate: {
        isUUID: {
          args: 4,
          msg: 'El UUID del cliente no es válido.',
        },
      },
    },

    /*
     * Sereno responsable.
     *
     * Se obtiene exclusivamente desde req.usuario.id.
     */
    sereno_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    /*
     * Código oficial seleccionado.
     */
    modalidad_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },

    /*
     * Relaciones operativas opcionales.
     */
    incidencia_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    patrullaje_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    zona_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    unidad_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    // =====================================================
    // GENERALIDADES
    // =====================================================
    origen: {
      type: DataTypes.ENUM(
        'CAMARA_VIDEO_VIGILANCIA',
        'REQUERIMIENTO_TELEFONICO',
        'PATRULLAJE',
        'OPERATIVO',
        'REDES_SOCIALES',
        'BOTON_PANICO',
        'OTRO',
      ),
      allowNull: true,
    },

    origen_otro: {
      type: DataTypes.STRING(250),
      allowNull: true,

      validate: {
        len: {
          args: [0, 250],
          msg: 'La descripción del origen no puede superar los 250 caracteres.',
        },
      },
    },

    modalidad_patrullaje: {
      type: DataTypes.ENUM(
        'INTEGRADO',
        'MUNICIPAL',
      ),
      allowNull: true,
    },

    tipo_patrullaje: {
      type: DataTypes.ENUM(
        'MOTORIZADO',
        'A_PIE',
        'BICICLETA',
        'OTRO',
      ),
      allowNull: true,
    },

    tipo_patrullaje_otro: {
      type: DataTypes.STRING(150),
      allowNull: true,

      validate: {
        len: {
          args: [0, 150],
          msg: 'El otro tipo de patrullaje no puede superar los 150 caracteres.',
        },
      },
    },

    turno: {
      type: DataTypes.ENUM(
        'MANANA',
        'TARDE',
        'NOCHE',
      ),
      allowNull: true,
    },

    // =====================================================
    // VEHÍCULO
    // =====================================================
    placa_vehiculo: {
      type: DataTypes.STRING(20),
      allowNull: true,

      validate: {
        len: {
          args: [0, 20],
          msg: 'La placa del vehículo no puede superar los 20 caracteres.',
        },
      },
    },

    tipo_vehiculo: {
      type: DataTypes.ENUM(
        'AUTO',
        'CAMIONETA_DOBLE_CABINA',
        'MOTO_LINEAL',
        'OTRO',
        'NO_APLICA',
      ),
      allowNull: true,
    },

    tipo_vehiculo_otro: {
      type: DataTypes.STRING(150),
      allowNull: true,

      validate: {
        len: {
          args: [0, 150],
          msg: 'El otro tipo de vehículo no puede superar los 150 caracteres.',
        },
      },
    },

    // =====================================================
    // FECHA Y TIEMPOS DE ATENCIÓN
    // =====================================================
    fecha_ocurrencia: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },

    hora_alerta: {
      type: DataTypes.TIME,
      allowNull: true,
    },

    hora_llegada: {
      type: DataTypes.TIME,
      allowNull: true,
    },

    hora_repliegue: {
      type: DataTypes.TIME,
      allowNull: true,
    },

    // =====================================================
    // RESULTADO Y RELACIÓN ENTRE PERSONAS
    // =====================================================
    resultado: {
      type: DataTypes.ENUM(
        'CONSUMADO',
        'FRUSTRADO',
        'NO_APLICA',
      ),
      allowNull: true,
    },

    relacion_victima_victimario: {
      type: DataTypes.ENUM(
        'ESPOSA_EX_ESPOSA',
        'PAREJA_EX_PAREJA',
        'PADRE',
        'MADRE',
        'FAMILIAR',
        'CONOCIDO',
        'DESCONOCIDO',
        'NO_APLICA',
      ),
      allowNull: true,
      defaultValue: 'NO_APLICA',
    },

    // =====================================================
    // LUGAR DE LA OCURRENCIA
    // =====================================================
    tipo_lugar: {
      type: DataTypes.ENUM(
        'VIA_PUBLICA',
        'INMUEBLE_PARTICULAR',
        'CENTRO_COMERCIAL',
        'DEPOSITO',
        'DEPENDENCIA_ESTATAL',
        'FABRICA',
        'ENTIDAD_FINANCIERA',
        'OTRO',
      ),
      allowNull: true,
    },

    tipo_lugar_otro: {
      type: DataTypes.STRING(250),
      allowNull: true,

      validate: {
        len: {
          args: [0, 250],
          msg: 'El otro tipo de lugar no puede superar los 250 caracteres.',
        },
      },
    },

    // =====================================================
    // DIRECCIÓN Y GEOREFERENCIACIÓN
    // =====================================================
    tipo_via: {
      type: DataTypes.ENUM(
        'AVENIDA',
        'CALLE',
        'JIRON',
        'PASAJE',
        'SIN_DATO',
      ),
      allowNull: true,
    },

    direccion: {
      type: DataTypes.STRING(500),
      allowNull: true,

      validate: {
        len: {
          args: [0, 500],
          msg: 'La dirección no puede superar los 500 caracteres.',
        },
      },
    },

    referencia: {
      type: DataTypes.STRING(500),
      allowNull: true,

      validate: {
        len: {
          args: [0, 500],
          msg: 'La referencia no puede superar los 500 caracteres.',
        },
      },
    },

    manzana: {
      type: DataTypes.STRING(20),
      allowNull: true,

      validate: {
        len: {
          args: [0, 20],
          msg: 'La manzana no puede superar los 20 caracteres.',
        },
      },
    },

    lote: {
      type: DataTypes.STRING(20),
      allowNull: true,

      validate: {
        len: {
          args: [0, 20],
          msg: 'El lote no puede superar los 20 caracteres.',
        },
      },
    },

    tipo_zona: {
      type: DataTypes.ENUM(
        'ASOCIACION_VIVIENDA',
        'BARRIO',
        'CONJUNTO_HABITACIONAL',
        'COOPERATIVA_VIVIENDA',
        'PUEBLO_JOVEN',
        'UPIS',
        'URBANIZACION',
        'SIN_DATO',
      ),
      allowNull: true,
    },

    nombre_zona: {
      type: DataTypes.STRING(250),
      allowNull: true,

      validate: {
        len: {
          args: [0, 250],
          msg: 'El nombre de la zona no puede superar los 250 caracteres.',
        },
      },
    },

    sector_patrullaje: {
      type: DataTypes.STRING(150),
      allowNull: true,

      validate: {
        len: {
          args: [0, 150],
          msg: 'El sector de patrullaje no puede superar los 150 caracteres.',
        },
      },
    },

    /*
     * Código de ubigeo de seis dígitos.
     * Ejemplo para Cusco: 080101.
     */
    ubigeo: {
      type: DataTypes.STRING(6),
      allowNull: true,

      validate: {
        formatoUbigeo(value) {
          if (
            value &&
            !/^\d{6}$/.test(value)
          ) {
            throw new Error(
              'El ubigeo debe contener exactamente seis dígitos.',
            );
          }
        },
      },
    },

    latitud: {
      type: DataTypes.DECIMAL(10, 7),
      allowNull: true,

      validate: {
        min: {
          args: [-90],
          msg: 'La latitud no puede ser menor que -90.',
        },

        max: {
          args: [90],
          msg: 'La latitud no puede ser mayor que 90.',
        },
      },
    },

    longitud: {
      type: DataTypes.DECIMAL(11, 7),
      allowNull: true,

      validate: {
        min: {
          args: [-180],
          msg: 'La longitud no puede ser menor que -180.',
        },

        max: {
          args: [180],
          msg: 'La longitud no puede ser mayor que 180.',
        },
      },
    },

    // =====================================================
    // DATOS IMPORTANTES
    // =====================================================
    datos_importantes: {
      type: DataTypes.STRING(140),
      allowNull: true,

      validate: {
        len: {
          args: [0, 140],
          msg: 'Los datos importantes no pueden superar los 140 caracteres.',
        },
      },
    },

    // =====================================================
    // ESTADO
    // =====================================================
    estado: {
      type: DataTypes.ENUM(
        'BORRADOR',
        'REGISTRADA',
        'PENDIENTE_VALIDACION',
        'OBSERVADA',
        'VALIDADA',
        'CERRADA',
        'ANULADA',
      ),
      allowNull: false,
      defaultValue: 'BORRADOR',
    },

    motivo_anulacion: {
      type: DataTypes.STRING(1000),
      allowNull: true,

      validate: {
        len: {
          args: [0, 1000],
          msg: 'El motivo de anulación no puede superar los 1000 caracteres.',
        },
      },
    },

    // =====================================================
    // REMISIÓN AL MINISTERIO
    // =====================================================

    estado_remision: {
      type: DataTypes.ENUM(
        'NO_PREPARADA',
        'PENDIENTE_ENVIO',
        'ENVIADA',
        'ERROR_ENVIO',
      ),
      allowNull: false,
      defaultValue: 'NO_PREPARADA',
    },

    fecha_remision: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    constancia_remision: {
      type: DataTypes.STRING(250),
      allowNull: true,

      validate: {
        len: {
          args: [0, 250],
          msg: 'La constancia de remisión no puede superar los 250 caracteres.',
        },
      },
    },
  },
  {
    tableName: 'ocurrencias',
    timestamps: true,
    underscored: true,

    indexes: [
      {
        name: 'uq_ocurrencia_numero',
        unique: true,
        fields: ['numero_ocurrencia'],
      },
      {
        name: 'uq_ocurrencia_uuid_cliente',
        unique: true,
        fields: ['uuid_cliente'],
      },
      {
        /*
         * MySQL permite múltiples valores NULL.
         * Evita que una incidencia genere dos ocurrencias.
         */
        name: 'idx_ocurrencia_incidencia',
        unique: true,
        fields: ['incidencia_id'],
      },
      {
        name: 'idx_ocurrencia_sereno',
        fields: ['sereno_id'],
      },
      {
        name: 'idx_ocurrencia_modalidad',
        fields: ['modalidad_id'],
      },
      {
        name: 'idx_ocurrencia_patrullaje',
        fields: ['patrullaje_id'],
      },
      {
        name: 'idx_ocurrencia_zona',
        fields: ['zona_id'],
      },
      {
        name: 'idx_ocurrencia_unidad',
        fields: ['unidad_id'],
      },
      {
        name: 'idx_ocurrencia_fecha',
        fields: ['fecha_ocurrencia'],
      },
      {
        name: 'idx_ocurrencia_estado',
        fields: ['estado'],
      },
      {
        name: 'idx_ocurrencia_codigo_fecha',
        fields: [
          'modalidad_id',
          'fecha_ocurrencia',
        ],
      },
      {
        name: 'idx_ocurrencia_zona_fecha',
        fields: [
          'zona_id',
          'fecha_ocurrencia',
        ],
      },
      {
        name: 'idx_ocurrencia_sereno_fecha',
        fields: [
          'sereno_id',
          'fecha_ocurrencia',
        ],
      },
      {
        name: 'idx_ocurrencia_remision',
        fields: ['estado_remision'],
      },
    ],

    validate: {
      validarOrigenOtro() {
        if (
          this.origen === 'OTRO' &&
          !String(this.origen_otro || '').trim()
        ) {
          throw new Error(
            'Debe especificar el origen cuando seleccione OTRO.',
          );
        }

        if (
          this.origen !== 'OTRO' &&
          this.origen_otro
        ) {
          throw new Error(
            'El campo origen_otro solo puede utilizarse cuando el origen es OTRO.',
          );
        }
      },

      validarTipoPatrullajeOtro() {
        if (
          this.tipo_patrullaje === 'OTRO' &&
          !String(
            this.tipo_patrullaje_otro || '',
          ).trim()
        ) {
          throw new Error(
            'Debe especificar el tipo de patrullaje cuando seleccione OTRO.',
          );
        }

        if (
          this.tipo_patrullaje !== 'OTRO' &&
          this.tipo_patrullaje_otro
        ) {
          throw new Error(
            'El campo tipo_patrullaje_otro solo puede utilizarse cuando el tipo de patrullaje es OTRO.',
          );
        }
      },

      validarTipoVehiculoOtro() {
        if (
          this.tipo_vehiculo === 'OTRO' &&
          !String(
            this.tipo_vehiculo_otro || '',
          ).trim()
        ) {
          throw new Error(
            'Debe especificar el tipo de vehículo cuando seleccione OTRO.',
          );
        }

        if (
          this.tipo_vehiculo !== 'OTRO' &&
          this.tipo_vehiculo_otro
        ) {
          throw new Error(
            'El campo tipo_vehiculo_otro solo puede utilizarse cuando el tipo de vehículo es OTRO.',
          );
        }
      },

      validarTipoLugarOtro() {
        if (
          this.tipo_lugar === 'OTRO' &&
          !String(
            this.tipo_lugar_otro || '',
          ).trim()
        ) {
          throw new Error(
            'Debe especificar el lugar cuando seleccione OTRO.',
          );
        }

        if (
          this.tipo_lugar !== 'OTRO' &&
          this.tipo_lugar_otro
        ) {
          throw new Error(
            'El campo tipo_lugar_otro solo puede utilizarse cuando el lugar es OTRO.',
          );
        }
      },

      validarNombreZona() {
        if (
          this.tipo_zona === 'SIN_DATO' &&
          String(this.nombre_zona || '').trim()
        ) {
          throw new Error(
            'No se debe registrar un nombre de zona cuando el tipo de zona es SIN_DATO.',
          );
        }
      },

      validarCoordenadas() {
        const tieneLatitud =
          this.latitud !== null &&
          this.latitud !== undefined;

        const tieneLongitud =
          this.longitud !== null &&
          this.longitud !== undefined;

        if (tieneLatitud !== tieneLongitud) {
          throw new Error(
            'La latitud y longitud deben registrarse conjuntamente.',
          );
        }
      },

      validarAnulacion() {
        if (
          this.estado === 'ANULADA' &&
          !String(
            this.motivo_anulacion || '',
          ).trim()
        ) {
          throw new Error(
            'El motivo de anulación es obligatorio.',
          );
        }

        if (
          this.estado !== 'ANULADA' &&
          this.motivo_anulacion
        ) {
          throw new Error(
            'El motivo de anulación solo puede registrarse cuando la ocurrencia está anulada.',
          );
        }
      },

      validarRemision() {
        if (
          this.estado_remision === 'ENVIADA' &&
          !this.fecha_remision
        ) {
          throw new Error(
            'La fecha de remisión es obligatoria cuando la ocurrencia fue enviada.',
          );
        }
      },
    },
  },
);

module.exports = Ocurrencia;