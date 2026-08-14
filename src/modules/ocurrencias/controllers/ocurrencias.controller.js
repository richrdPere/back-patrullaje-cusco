const {
  crearOcurrenciaService,
  getOcurrenciaByIdService,
  getOcurrenciasPaginadasService,

} = require('../services/ocurrencias');
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




module.exports = {
  createOcurrenciaController,
  getOcurrenciasPaginadasController,
  getOcurrenciaByIdController,
};