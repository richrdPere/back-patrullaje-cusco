const {
  crearOcurrenciaService,
  getOcurrenciaByIdService,
  getOcurrenciasExportablesService,
  getOcurrenciasPaginadasService,
} = require('../services/ocurrencias');

// Services de generacion
const {
  generarOcurrenciaJson,
  generarOcurrenciaPdf,
  generarOcurrenciasCsvService,
  generarOcurrenciasXlsx,
} = require("../services/ocurrencias/exportacion");
/*
|--------------------------------------------------------------------------
| HELPERS
|--------------------------------------------------------------------------
*/
const obtenerRoles = (usuario = {}) =>
  usuario.roles ??
  usuario.rol ??
  usuario.role ??
  [];

const obtenerNombreUsuario = (usuario = {}) => {
  const persona = usuario.persona;

  const nombrePersona = [
    persona?.nombres,
    persona?.apellidos,
  ]
    .filter(Boolean)
    .join(' ')
    .trim();

  return (
    nombrePersona ||
    usuario.nombre ||
    usuario.username ||
    `Usuario ${usuario.id}`
  );
};

const limpiarNombreArchivo = (nombre) =>
  String(nombre || 'archivo')
    .replace(/[^a-zA-Z0-9_-]/g, '-')
    .replace(/-+/g, '-');

const responderError = (
  res,
  error,
  mensajeInterno,
  codigoInterno,
) => {
  const statusCode =
    error.statusCode || 500;

  return res.status(statusCode).json({
    success: false,

    message:
      statusCode === 500
        ? mensajeInterno
        : error.message,

    code:
      error.code ||
      codigoInterno,

    error:
      process.env.NODE_ENV === 'development'
        ? error.message
        : undefined,
  });
};


/*
|--------------------------------------------------------------------------
| 1. Crear Ocurrencias
|--------------------------------------------------------------------------
*/
const createOcurrenciaController = async (req, res) => {
  try {
    const serenoId = req.usuario.id;

    const ocurrencia =
      await crearOcurrenciaService({
        serenoId,
        data: req.body,
      });

    return res.status(201).json({
      success: true,
      message: 'Ocurrencia guardada como borrador correctamente.',
      data: ocurrencia,
    });
  } catch (error) {
    console.error('Error al registrar ocurrencia:', error);

    return res
      .status(error.statusCode || 500)
      .json({
        success: false,
        message: 'No se pudo registrar la ocurrencia.',
        error: error.message
      });
  }
};
/*
|--------------------------------------------------------------------------
| 2. Obtener Ocurrencias Paginado
|--------------------------------------------------------------------------
*/
const getOcurrenciasPaginadasController = async (
  req,
  res,
) => {
  try {
    const usuarioAutenticado = req.usuario;

    if (!usuarioAutenticado?.id) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no autenticado.',
        code: 'USUARIO_NO_AUTENTICADO',
      });
    }

    const resultado =
      await getOcurrenciasPaginadasService({
        usuarioId: usuarioAutenticado.id,
        roles:
          usuarioAutenticado.roles ??
          usuarioAutenticado.rol ??
          usuarioAutenticado.role,

        page: req.query.page,
        limit: req.query.limit,

        numero: req.query.numero,
        codigo: req.query.codigo,

        fecha: req.query.fecha,
        fechaDesde: req.query.fecha_desde,
        fechaHasta: req.query.fecha_hasta,

        serenoId: req.query.sereno_id,
        zonaId: req.query.zona_id,

        turno: req.query.turno,
        estado: req.query.estado,
        estadoRemision:
          req.query.estado_remision,
      });

    return res.status(200).json({
      success: true,
      message: 'Ocurrencias consultadas correctamente.',
      data: resultado,
    });
  } catch (error) {
    console.error('Error al consultar ocurrencias paginadas:', error,);

    return res.status(500).json({
      success: false,
      message: 'No se pudieron consultar las ocurrencias.',
      error: error.message
    });
  }
};
/*
|--------------------------------------------------------------------------
| 3. Obtener Ocurrencias Por ID
|--------------------------------------------------------------------------
*/
const getOcurrenciaByIdController = async (req, res,) => {
  try {
    const usuarioAutenticado = req.usuario;

    if (!usuarioAutenticado?.id) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no autenticado.',
        code: 'USUARIO_NO_AUTENTICADO',
      });
    }

    const ocurrencia = await getOcurrenciaByIdService(
      req.params.id,
      {
        usuarioId: usuarioAutenticado.id,

        roles:
          usuarioAutenticado.roles ??
          usuarioAutenticado.rol ??
          usuarioAutenticado.role,
      },
    );

    return res.status(200).json({
      success: true,
      message:
        'Detalle de la ocurrencia consultado correctamente.',
      data: ocurrencia,
    });
  } catch (error) {
    console.error(
      'Error al consultar detalle de ocurrencia:',
      error,
    );

    const statusCode =
      error.statusCode || 500;

    return res.status(statusCode).json({
      success: false,
      message: 'No se pudo consultar la ocurrencia.',
      error: error.message
    });
  }
};
/*
|--------------------------------------------------------------------------
| 4. EXPORTAR UNA OCURRENCIA
|--------------------------------------------------------------------------
|
| Formatos permitidos:
| - PDF
| - JSON
|
| GET /api/ocurrencias/:id/formato?formato=pdf
| GET /api/ocurrencias/:id/formato?formato=json
|
*/
const exportarOcurrenciaController = async (
  req,
  res,
) => {
  try {
    if (!req.usuario?.id) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no autenticado.',
        code: 'USUARIO_NO_AUTENTICADO',
      });
    }

    const formato = String(
      req.query.formato || 'pdf',
    )
      .trim()
      .toLowerCase();

    const formatosPermitidos = [
      'pdf',
      'json',
    ];

    if (!formatosPermitidos.includes(formato)) {
      return res.status(400).json({
        success: false,
        message:
          'El formato individual debe ser PDF o JSON.',
        code: 'FORMATO_NO_SOPORTADO',
      });
    }

    /*
     * Este service valida:
     * - existencia;
     * - propiedad de la ocurrencia;
     * - permisos por rol;
     * - acceso a información sensible.
     */
    const ocurrencia = await getOcurrenciaByIdService(
      req.params.id,
      {
        usuarioId: req.usuario.id,
        roles: obtenerRoles(req.usuario),
      },
    );

    const generadoPor =
      obtenerNombreUsuario(req.usuario);

    const nombreBase = limpiarNombreArchivo(
      ocurrencia.numero_ocurrencia ||
      `ocurrencia-${ocurrencia.id}`,
    );

    // ==================================================
    // JSON INDIVIDUAL
    // ==================================================
    if (formato === 'json') {
      const documento = generarOcurrenciaJson(
        ocurrencia,
        {
          generadoPor,
        },
      );

      const contenido = JSON.stringify(
        documento,
        null,
        2,
      );

      res.setHeader(
        'Content-Type',
        'application/json; charset=utf-8',
      );

      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${nombreBase}.json"`,
      );

      res.setHeader(
        'Content-Length',
        Buffer.byteLength(
          contenido,
          'utf8',
        ),
      );

      return res
        .status(200)
        .send(contenido);
    }

    // ==================================================
    // PDF INDIVIDUAL
    // ==================================================
    const pdf = await generarOcurrenciaPdf(
      ocurrencia,
      {
        generadoPor,
      },
    );

    res.setHeader(
      'Content-Type',
      'application/pdf',
    );

    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${nombreBase}.pdf"`,
    );

    res.setHeader(
      'Content-Length',
      pdf.length,
    );

    return res
      .status(200)
      .send(pdf);
  } catch (error) {
    console.error(
      'Error al generar formato individual:',
      error,
    );

    return responderError(
      res,
      error,
      'No se pudo generar el formato de la ocurrencia.',
      'ERROR_GENERAR_FORMATO_OCURRENCIA',
    );
  }
};
/*
|--------------------------------------------------------------------------
| 6. EXPORTAR CONSOLIDADO DE OCURRENCIAS
|--------------------------------------------------------------------------
|
| Formatos permitidos:
| - CSV
| - XLSX
| - JSON
|
| Se aplican los mismos filtros que en el paginado.
|
| GET /api/ocurrencias/exportar?formato=xlsx
|
*/
const exportarConsolidadoOcurrenciasController = async (
  req,
  res,
) => {
  try {
    if (!req.usuario?.id) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no autenticado.',
        code: 'USUARIO_NO_AUTENTICADO',
      });
    }

    const formato = String(
      req.query.formato || 'xlsx',
    )
      .trim()
      .toLowerCase();

    const formatosPermitidos = [
      'csv',
      'xlsx',
      'json',
    ];

    if (!formatosPermitidos.includes(formato)) {
      return res.status(400).json({
        success: false,
        message:
          'El formato consolidado debe ser CSV, XLSX o JSON.',
        code: 'FORMATO_NO_SOPORTADO',
      });
    }

    const filtros = {
      numero: req.query.numero,
      codigo: req.query.codigo,

      fecha: req.query.fecha,
      fechaDesde: req.query.fecha_desde,
      fechaHasta: req.query.fecha_hasta,
      serenoId: req.query.sereno_id,
      zonaId: req.query.zona_id,
      turno: req.query.turno,
      estado: req.query.estado,
      estadoRemision: req.query.estado_remision,
    };

    /*
     * El service debe aplicar:
     * - filtros;
     * - permisos por rol;
     * - límite máximo de exportación;
     * - restricción del sereno a sus registros.
     */
    const ocurrencias =
      await getOcurrenciasExportablesService({
        usuarioId: req.usuario.id,
        roles: obtenerRoles(req.usuario),
        filtros,
      });

    const generadoPor =
      obtenerNombreUsuario(req.usuario);

    const fechaArchivo =
      new Date()
        .toISOString()
        .slice(0, 10);

    const nombreBase =
      `ocurrencias-${fechaArchivo}`;

    // ==================================================
    // JSON CONSOLIDADO
    // ==================================================
    if (formato === 'json') {
      const data = ocurrencias.map(
        (ocurrencia) =>
          typeof ocurrencia.toJSON === 'function'
            ? ocurrencia.toJSON()
            : ocurrencia,
      );

      const documento = {
        metadata: {
          tipo_documento:
            'CONSOLIDADO_OCURRENCIAS',

          generado_por:
            generadoPor,

          fecha_generacion:
            new Date().toISOString(),

          total_registros:
            data.length,

          filtros,
        },

        data,
      };

      const contenido = JSON.stringify(
        documento,
        null,
        2,
      );

      res.setHeader(
        'Content-Type',
        'application/json; charset=utf-8',
      );

      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${nombreBase}.json"`,
      );

      res.setHeader(
        'Content-Length',
        Buffer.byteLength(
          contenido,
          'utf8',
        ),
      );

      return res
        .status(200)
        .send(contenido);
    }

    // ==================================================
    // CSV CONSOLIDADO
    // ==================================================
    if (formato === 'csv') {
      const csv = await generarOcurrenciasCsvService(
        ocurrencias,
        {
          generadoPor,
        },
      );

      const contenidoCsv =
        Buffer.isBuffer(csv)
          ? csv
          : Buffer.from(
            csv,
            'utf8',
          );

      res.setHeader(
        'Content-Type',
        'text/csv; charset=utf-8',
      );

      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${nombreBase}.csv"`,
      );

      res.setHeader(
        'Content-Length',
        contenidoCsv.length,
      );

      return res
        .status(200)
        .send(contenidoCsv);
    }

    // ==================================================
    // XLSX CONSOLIDADO
    // ==================================================
    const xlsx = await generarOcurrenciasXlsx(
      ocurrencias,
      {
        generadoPor,
      },
    );

    const contenidoXlsx =
      Buffer.isBuffer(xlsx)
        ? xlsx
        : Buffer.from(xlsx);

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );

    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${nombreBase}.xlsx"`,
    );

    res.setHeader(
      'Content-Length',
      contenidoXlsx.length,
    );

    return res
      .status(200)
      .send(contenidoXlsx);
  } catch (error) {
    console.error(
      'Error al exportar consolidado de ocurrencias:',
      error,
    );

    return responderError(
      res,
      error,
      'No se pudieron exportar las ocurrencias.',
      'ERROR_EXPORTAR_OCURRENCIAS',
    );
  }
};



module.exports = {
  createOcurrenciaController,
  getOcurrenciasPaginadasController,
  getOcurrenciaByIdController,
  exportarOcurrenciaController,
  exportarConsolidadoOcurrenciasController,
};