const {
  getResumenOperativoService
} = require("../services");

/*
|--------------------------------------------------------------------------
| 1. Obtener resumen operativo
|--------------------------------------------------------------------------
*/
const getResumenOperativoController = async (req, res) => {
  try {
    const data = await getResumenOperativoService();

    return res.status(200).json({
      success: true,
      message: 'Resumen operativo obtenido correctamente',
      data
    });

  } catch (error) {
    console.error('Error al obtener resumen:', error);

    return res.status(500).json({
      success: false,
      message: 'No se pudo obtener el resumen operativo',
      error: error.message
    });
  }
};

module.exports = {
  getResumenOperativoController
};