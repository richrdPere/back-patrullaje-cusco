const { Op } = require('sequelize');
const db = require('../../../../database/models');

// Modelos
const { Ocurrencia } = db;

// ENUMS
const ROLES_CONSULTA_GLOBAL = new Set([
  'ADMIN',
  'SUPERVISOR_SERENAZGO',
  'GERENTE_SERENAZGO',
  'OPERADOR',
]);

// Helpers
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

const limpiarTexto = (value) => {
  if (value === undefined || value === null) {
    return null;
  }

  const texto = String(value).trim();

  return texto || null;
};

const convertirEnteroPositivo = (
  value,
  nombreCampo,
  {
    requerido = false,
    valorPorDefecto = null,
  } = {},
) => {
  if (
    value === undefined ||
    value === null ||
    value === ''
  ) {
    if (requerido) {
      throw crearError(
        `El campo ${nombreCampo} es obligatorio.`,
        400,
        'PARAMETRO_OBLIGATORIO',
      );
    }

    return valorPorDefecto;
  }

  const numero = Number(value);

  if (
    !Number.isInteger(numero) ||
    numero <= 0
  ) {
    throw crearError(
      `El campo ${nombreCampo} debe ser un entero positivo.`,
      400,
      'PARAMETRO_INVALIDO',
    );
  }

  return numero;
};

const fechaValida = (fecha) => {
  if (!fecha) {
    return true;
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
    return false;
  }

  const fechaParseada = new Date(`${fecha}T00:00:00Z`);

  return !Number.isNaN(fechaParseada.getTime());
};

/**
 * Acepta roles con diferentes estructuras:
 *
 * 'SERENO'
 * ['SERENO']
 * [{ nombre: 'SERENO' }]
 * [{ rol: 'SERENO' }]
 * [{ codigo: 'SERENO' }]
 */
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
    .map((rol) => String(rol).trim().toUpperCase());
};

const validarPermisosConsulta = ({
  usuarioId,
  roles,
}) => {
  const parsedUsuarioId = convertirEnteroPositivo(
    usuarioId,
    'usuarioId',
    {
      requerido: true,
    },
  );

  const rolesNormalizados = normalizarRoles(roles);

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
      'SIN_PERMISO_CONSULTAR_OCURRENCIAS',
    );
  }

  return {
    usuarioId: parsedUsuarioId,
    roles: rolesNormalizados,
    esSereno,
    tieneConsultaGlobal,
  };
};


// SERVICES
const getOcurrenciasPaginadas = async ({
  usuarioId,
  roles,

  page = 1,
  limit = 20,

  numero = null,
  codigo = null,

  fecha = null,
  fechaDesde = null,
  fechaHasta = null,

  serenoId = null,
  zonaId = null,

  turno = null,
  estado = null,
  estadoRemision = null,
}) => {
  // =====================================================
  // 1. PERMISOS
  // =====================================================
  const permisos = validarPermisosConsulta({
    usuarioId,
    roles,
  });

  // =====================================================
  // 2. PAGINACIÓN
  // =====================================================
  const parsedPage = convertirEnteroPositivo(
    page,
    'page',
    {
      valorPorDefecto: 1,
    },
  );

  const limitSolicitado = convertirEnteroPositivo(
    limit,
    'limit',
    {
      valorPorDefecto: 20,
    },
  );

  const parsedLimit = Math.min(
    limitSolicitado,
    100,
  );

  const offset =
    (parsedPage - 1) * parsedLimit;

  // =====================================================
  // 3. NORMALIZAR FILTROS
  // =====================================================
  const numeroBusqueda = limpiarTexto(numero);
  const codigoBusqueda = limpiarTexto(codigo);

  const fechaBusqueda = limpiarTexto(fecha);
  const fechaDesdeBusqueda = limpiarTexto(fechaDesde);
  const fechaHastaBusqueda = limpiarTexto(fechaHasta);

  const turnoBusqueda = limpiarTexto(turno);
  const estadoBusqueda = limpiarTexto(estado);
  const remisionBusqueda = limpiarTexto(estadoRemision);

  if (!fechaValida(fechaBusqueda)) {
    throw crearError(
      'El filtro fecha debe utilizar el formato YYYY-MM-DD.',
      400,
      'FECHA_INVALIDA',
    );
  }

  if (!fechaValida(fechaDesdeBusqueda)) {
    throw crearError(
      'El filtro fecha_desde debe utilizar el formato YYYY-MM-DD.',
      400,
      'FECHA_DESDE_INVALIDA',
    );
  }

  if (!fechaValida(fechaHastaBusqueda)) {
    throw crearError(
      'El filtro fecha_hasta debe utilizar el formato YYYY-MM-DD.',
      400,
      'FECHA_HASTA_INVALIDA',
    );
  }

  if (
    fechaDesdeBusqueda &&
    fechaHastaBusqueda &&
    fechaDesdeBusqueda > fechaHastaBusqueda
  ) {
    throw crearError(
      'La fecha_desde no puede ser posterior a fecha_hasta.',
      400,
      'RANGO_FECHAS_INVALIDO',
    );
  }

  // =====================================================
  // 4. WHERE PRINCIPAL
  // =====================================================
  const where = {};

  if (numeroBusqueda) {
    where.numero_ocurrencia = {
      [Op.like]: `%${numeroBusqueda}%`,
    };
  }

  if (fechaBusqueda) {
    where.fecha_ocurrencia = fechaBusqueda;
  } else if (
    fechaDesdeBusqueda ||
    fechaHastaBusqueda
  ) {
    where.fecha_ocurrencia = {};

    if (fechaDesdeBusqueda) {
      where.fecha_ocurrencia[Op.gte] =
        fechaDesdeBusqueda;
    }

    if (fechaHastaBusqueda) {
      where.fecha_ocurrencia[Op.lte] =
        fechaHastaBusqueda;
    }
  }

  if (zonaId !== undefined && zonaId !== null && zonaId !== '') {
    where.zona_id = convertirEnteroPositivo(
      zonaId,
      'zona_id',
    );
  }

  if (turnoBusqueda) {
    where.turno = turnoBusqueda.toUpperCase();
  }

  if (estadoBusqueda) {
    where.estado = estadoBusqueda.toUpperCase();
  }

  if (remisionBusqueda) {
    where.estado_remision =
      remisionBusqueda.toUpperCase();
  }

  // =====================================================
  // 5. RESTRICCIÓN POR ROL
  // =====================================================

  /*
   * El SERENO siempre consulta únicamente sus ocurrencias.
   * No se confía en un sereno_id enviado por query params.
   */
  if (
    permisos.esSereno &&
    !permisos.tieneConsultaGlobal
  ) {
    where.sereno_id = permisos.usuarioId;
  } else if (
    serenoId !== undefined &&
    serenoId !== null &&
    serenoId !== ''
  ) {
    where.sereno_id = convertirEnteroPositivo(
      serenoId,
      'sereno_id',
    );
  }

  // =====================================================
  // 6. INCLUDE
  // =====================================================
  const include = [
    {
      association: 'sereno',
      attributes: [
        'id',
        'persona_id',
      ],
      required: true,
      include: [
        {
          association: 'persona',
          attributes: [
            'id',
            'nombres',
            'apellidos',
            'documento_identidad',
          ],
          required: false,
        },
      ],
    },

    {
      association: 'modalidad',
      required: Boolean(codigoBusqueda),

      where: codigoBusqueda
        ? {
          codigo: {
            [Op.like]: `%${codigoBusqueda}%`,
          },
        }
        : undefined,

      attributes: [
        'id',
        'codigo',
        'nombre',
        'estado',
      ],

      include: [
        {
          association: 'categoria_especifica',
          attributes: [
            'id',
            'codigo',
            'nombre',
          ],
          include: [
            {
              association: 'categoria_generica',
              attributes: [
                'id',
                'codigo',
                'nombre',
              ],
            },
          ],
        },
      ],
    },

    {
      association: 'incidencia',
      required: false,
    },

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
  ];

  // =====================================================
  // 7. CONSULTA
  // =====================================================
  const {
    count,
    rows,
  } = await Ocurrencia.findAndCountAll({
    where,
    include,

    distinct: true,

    limit: parsedLimit,
    offset,

    order: [
      ['fecha_ocurrencia', 'DESC'],
      ['created_at', 'DESC'],
      ['id', 'DESC'],
    ],
  });

  const totalItems = Number(count);
  const totalPages = Math.ceil(
    totalItems / parsedLimit,
  );

  return {
    items: rows,

    pagination: {
      totalItems,
      totalPages,
      currentPage: parsedPage,
      pageSize: parsedLimit,
      hasNextPage: parsedPage < totalPages,
      hasPreviousPage: parsedPage > 1,
    },

    filters: {
      numero: numeroBusqueda,
      codigo: codigoBusqueda,
      fecha: fechaBusqueda,
      fecha_desde: fechaDesdeBusqueda,
      fecha_hasta: fechaHastaBusqueda,
      sereno_id: where.sereno_id || null,
      zona_id: where.zona_id || null,
      turno: turnoBusqueda,
      estado: estadoBusqueda,
      estado_remision: remisionBusqueda,
    },
  };
};

module.exports = getOcurrenciasPaginadas;