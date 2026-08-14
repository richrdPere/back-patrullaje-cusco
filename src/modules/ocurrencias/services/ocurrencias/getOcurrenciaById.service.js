const db = require('../../../../database/models');

const {
  Ocurrencia,
} = db;

const ROLES_CONSULTA_GLOBAL = new Set([
  'ADMIN',
  'SUPERVISOR_SERENAZGO',
  'GERENTE_SERENAZGO',
  'OPERADOR',
]);

const ROLES_INFORMACION_SENSIBLE = new Set([
  'ADMIN',
  'SUPERVISOR_SERENAZGO',
  'GERENTE_SERENAZGO',
]);

const crearError = (
  message,
  statusCode,
  code,
) => {
  const error = new Error(message);

  error.statusCode = statusCode;
  error.code = code;

  return error;
};

const normalizarRoles = (roles) => {
  if (!roles) {
    return [];
  }

  const lista = Array.isArray(roles)
    ? roles
    : [roles];

  return lista
    .map((rol) => {
      if (typeof rol === 'string') {
        return rol;
      }

      return (
        rol?.nombre ||
        rol?.rol ||
        rol?.codigo ||
        rol?.name ||
        null
      );
    })
    .filter(Boolean)
    .map((rol) =>
      String(rol).trim().toUpperCase(),
    );
};

const getOcurrenciaById = async (
  ocurrenciaId,
  {
    usuarioId,
    roles,
    transaction = null,
  } = {},
) => {
  const parsedOcurrenciaId = Number(ocurrenciaId);
  const parsedUsuarioId = Number(usuarioId);

  if (
    !Number.isInteger(parsedOcurrenciaId) ||
    parsedOcurrenciaId <= 0
  ) {
    throw crearError(
      'El identificador de la ocurrencia no es válido.',
      400,
      'OCURRENCIA_ID_INVALIDO',
    );
  }

  if (
    !Number.isInteger(parsedUsuarioId) ||
    parsedUsuarioId <= 0
  ) {
    throw crearError(
      'No se pudo identificar al usuario autenticado.',
      401,
      'USUARIO_NO_IDENTIFICADO',
    );
  }

  const rolesNormalizados =
    normalizarRoles(roles);

  if (rolesNormalizados.length === 0) {
    throw crearError(
      'No se pudo determinar el rol del usuario autenticado.',
      403,
      'ROL_NO_IDENTIFICADO',
    );
  }

  const esSereno =
    rolesNormalizados.includes('SERENO');

  const tieneConsultaGlobal =
    rolesNormalizados.some(
      (rol) => ROLES_CONSULTA_GLOBAL.has(rol),
    );

  if (!esSereno && !tieneConsultaGlobal) {
    throw crearError(
      'No tiene permisos para consultar ocurrencias.',
      403,
      'SIN_PERMISO_CONSULTAR_OCURRENCIA',
    );
  }

  // Consulta inicial para revisar propiedad y existencia.
  const ocurrenciaBase = await Ocurrencia.findByPk(
    parsedOcurrenciaId,
    {
      attributes: [
        'id',
        'sereno_id',
        'estado',
      ],
      transaction,
    },
  );

  if (!ocurrenciaBase) {
    throw crearError(
      'La ocurrencia solicitada no existe.',
      404,
      'OCURRENCIA_NO_ENCONTRADA',
    );
  }

  const esPropietario =
    Number(ocurrenciaBase.sereno_id) ===
    parsedUsuarioId;

  /*
   * Un sereno solamente puede consultar su propia ocurrencia,
   * salvo que también posea un rol de consulta global.
   */
  if (
    esSereno &&
    !tieneConsultaGlobal &&
    !esPropietario
  ) {
    throw crearError(
      'No tiene permisos para consultar esta ocurrencia.',
      403,
      'OCURRENCIA_NO_AUTORIZADA',
    );
  }

  const tieneRolSensible =
    rolesNormalizados.some(
      (rol) =>
        ROLES_INFORMACION_SENSIBLE.has(rol),
    );

  /*
   * Puede consultar información sensible:
   * - el sereno propietario;
   * - administrador;
   * - supervisor;
   * - gerente.
   *
   * El OPERADOR puede consultar el detalle operativo,
   * pero no documentos, identidad completa ni evidencias.
   */
  const puedeVerInformacionSensible =
    esPropietario || tieneRolSensible;

  const includeIncidencia = {
    association: 'incidencia',
    required: false,
  };

  /*
   * Las evidencias se encuentran asociadas a la incidencia.
   * Solo se incluyen para usuarios autorizados.
   */
  if (puedeVerInformacionSensible) {
    includeIncidencia.include = [
      {
        association: 'archivos',
        required: false,
        where: {
          estado: 'ACTIVO',
        },
      },
    ];
  }

  const ocurrencia = await Ocurrencia.findByPk(
    parsedOcurrenciaId,
    {
      include: [
        // ===============================================
        // SERENO RESPONSABLE
        // ===============================================
        {
          association: 'sereno',
          attributes: [
            'id',
            'persona_id',
          ],
          include: [
            {
              association: 'persona',

              attributes: puedeVerInformacionSensible
                ? [
                  'id',
                  'nombres',
                  'apellidos',
                  'documento_identidad',
                ]
                : [
                  'id',
                  'nombres',
                  'apellidos',
                ],

              required: false,
            },
          ],
        },

        // ===============================================
        // CLASIFICACIÓN OFICIAL
        // ===============================================
        {
          association: 'modalidad',

          include: [
            {
              association: 'categoria_especifica',

              include: [
                {
                  association: 'categoria_generica',

                  include: [
                    {
                      association: 'version',
                    },
                  ],
                },
              ],
            },

            {
              association: 'reglas',
              required: false,

              where: {
                estado: true,
              },
            },
          ],
        },

        // ===============================================
        // INCIDENCIA Y EVIDENCIAS
        // ===============================================
        includeIncidencia,

        // ===============================================
        // DATOS OPERATIVOS
        // ===============================================
        {
          association: 'patrullaje',
          required: false,
        },
        {
          association: 'zonas',
          required: false,
        },
        {
          association: 'unidad',
          required: false,
        },

        // ===============================================
        // PERSONAS INVOLUCRADAS
        // ===============================================
        {
          association: 'personas',
          required: false,
          separate: true,

          attributes: puedeVerInformacionSensible
            ? undefined
            : {
              exclude: [
                'documento_identidad',
                'nombres_apellidos',
                'caracteristicas_fisicas',
              ],
            },

          order: [
            ['orden', 'ASC'],
            ['id', 'ASC'],
          ],
        },

        // ===============================================
        // CONSECUENCIAS
        // ===============================================
        {
          association: 'consecuencias',
          required: false,
          separate: true,

          order: [
            ['id', 'ASC'],
          ],
        },

        // ===============================================
        // MEDIOS EMPLEADOS
        // ===============================================
        {
          association: 'medios_empleados',
          required: false,
          separate: true,

          order: [
            ['id', 'ASC'],
          ],
        },

        // ===============================================
        // EFECTIVOS PNP
        // ===============================================
        {
          association: 'efectivos_pnp',
          required: false,
          separate: true,

          attributes: puedeVerInformacionSensible
            ? undefined
            : {
              exclude: [
                'codigo_institucional',
                'apellidos',
                'nombres',
              ],
            },

          include: puedeVerInformacionSensible
            ? [
              {
                association: 'policia',
                required: false,
              },
            ]
            : [],

          order: [
            ['id', 'ASC'],
          ],
        },

        // ===============================================
        // ESTADO, VALIDACIÓN E HISTORIAL
        // ===============================================
        {
          association: 'historial',
          required: false,
          separate: true,

          attributes: puedeVerInformacionSensible
            ? undefined
            : {
              exclude: [
                'ip',
                'user_agent',
                'cambios',
              ],
            },

          include: [
            {
              association: 'usuario',
              required: false,
              attributes: [
                'id',
                'persona_id',
              ],
            },
          ],

          order: [
            ['created_at', 'ASC'],
            ['id', 'ASC'],
          ],
        },
      ],

      transaction,
    },
  );

  return ocurrencia;
};

module.exports = getOcurrenciaById;