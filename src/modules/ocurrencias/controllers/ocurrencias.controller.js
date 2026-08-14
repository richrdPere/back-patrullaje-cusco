const {
  crearOcurrenciaService,
  getOcurrenciaByIdService,
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
| 1. Crear Ocurrencias
|--------------------------------------------------------------------------
*/
module.exports = {
  createOcurrenciaController,
};