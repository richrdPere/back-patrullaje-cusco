const {
  createUnidadPService,
  getUnidadesPService,
  getUnidadPByIdService,
  updateUnidadPService,
  deleteUnidadPService,
  getCodigoUnidadPService,
  getUnidadesPAllService,
} = require("../services/unidad_patrullaje");

/*
|--------------------------------------------------------------------------
| 1. Crear Unidad de patrullaje
|--------------------------------------------------------------------------
*/
const createUnidadPController = async (req, res) => {

  try {

    const resultado =
      await createUnidadPService(
        req.body
      );

    return res.status(201).json({
      success: true,
      message: "Unidad creada correctamente.",
      data: resultado
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
/*
|--------------------------------------------------------------------------
| 2. Listar Unidades de Patrullaje
|--------------------------------------------------------------------------
*/
const getUnidadesPController = async (req, res) => {

  try {
    const resultado =
      await getUnidadesPService(
        req.query
      );

    return res.status(200).json({
      success: true,
      message: "Unidades obtenidas correctamente.",
      data: resultado
    });
  } catch (error) {

    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
/*
|--------------------------------------------------------------------------
| 3. Obtener Unidad de Patrullaje por ID
|--------------------------------------------------------------------------
*/
const getUnidadPByIdController = async (req, res) => {

  try {

    const resultado =
      await getUnidadPByIdService(
        req.params.id
      );

    return res.status(200).json({
      success: true,
      message: "Unidad obtenida correctamente.",
      data: resultado
    });
  } catch (error) {

    return res.status(404).json({
      success: false,
      message: error.message
    });
  }
};
/*
|--------------------------------------------------------------------------
| 4. Actualizar Unidad de Patrullaje
|--------------------------------------------------------------------------
*/
const updateUnidadPController = async (req, res) => {

  try {
    const resultado =
      await updateUnidadPService(
        req.params.id,
        req.body
      );

    return res.status(200).json({
      success: true,
      message: "Unidad actualizada correctamente.",
      data: resultado
    });

  } catch (error) {

    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
}
/*
|--------------------------------------------------------------------------
| 5. Eliminar Unidad de Patrullaje
|--------------------------------------------------------------------------
*/
const deleteUnidadPController = async (req, res) => {

  try {

    await deleteUnidadPService(
      req.params.id
    );

    return res.status(200).json({
      success: true,
      message: "Unidad eliminada correctamente."

    });

  } catch (error) {

    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
}
/*
|--------------------------------------------------------------------------
| 6. Obtener Siguiente Código de Unidad de Patrullaje
|--------------------------------------------------------------------------
*/
const getSiguienteCodigoController = async (req, res) => {

  try {

    const codigo = await getCodigoUnidadPService();

    return res.status(200).json({
      success: true,
      message: "Código generado correctamente.",
      data: {
        codigo
      }
    });
  } catch (error) {

    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
/*
|--------------------------------------------------------------------------
| 7. Obtener Todas las Unidades - Select
|--------------------------------------------------------------------------
*/
const getUnidadesPAllController = async (req, res) => {

  try {

    const resultado = await getUnidadesPAllService();

    return res.status(200).json({
      success: true,
      message: "Unidades obtenidas correctamente.",
      data: resultado
    });
  } catch (error) {

    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  createUnidadPController,
  getUnidadesPController,
  getUnidadPByIdController,
  updateUnidadPController,
  deleteUnidadPController,
  getSiguienteCodigoController,
  getUnidadesPAllController
};