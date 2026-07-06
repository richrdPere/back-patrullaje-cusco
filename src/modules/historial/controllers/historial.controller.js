const {
  createHistorialService,
  getHistorialByPatrullajeService,
  getHistorialByIdService,
  updateHistorialService,
  archiveHistorialService
} = require("../services");

/*
|--------------------------------------------------------------------------
| 1. Crear historial
|--------------------------------------------------------------------------
*/
const createHistorialController = async (req, res) => {

  try {

    const historial = await createHistorialService(
      req.usuario.id,
      req.body
    );

    return res.status(201).json({
      success: true,
      message: "Historial registrado correctamente.",
      data: historial
    });

  } catch (error) {

    console.error(error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message
    });
  }
};
/*
|--------------------------------------------------------------------------
| 2. Obtener historial por patrullaje
|--------------------------------------------------------------------------
*/
const getHistorialByPatrullajeController = async (req, res) => {

  try {

    const { id } = req.params;

    const historial = await getHistorialByPatrullajeService(id);

    return res.status(200).json({
      success: true,
      message: "Historial obtenido correctamente.",
      data: historial
    });

  } catch (error) {

    console.error(error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message
    });
  }
};
/*
|--------------------------------------------------------------------------
| 3. Obtener historial por Id
|--------------------------------------------------------------------------
*/
const getHistorialByIdController = async (req, res) => {

  try {

    const { id } = req.params;

    const historial = await getHistorialByIdService(id);

    return res.status(200).json({
      success: true,
      message: "Historial obtenido correctamente.",
      data: historial
    });

  } catch (error) {

    console.error(error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message
    });
  }
};
/*
|--------------------------------------------------------------------------
| 4. Actualizar historial
|--------------------------------------------------------------------------
*/
const updateHistorialController = async (req, res) => {

  try {

    const { id } = req.params;

    const historial = await updateHistorialService(
      id,
      req.usuario.id,
      req.body
    );

    return res.status(200).json({
      success: true,
      message: "Historial actualizado correctamente.",
      data: historial
    });

  } catch (error) {

    console.error(error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message
    });
  }
};
/*
|--------------------------------------------------------------------------
| 5. Archivar historial
|--------------------------------------------------------------------------
*/
const archiveHistorialController = async (req, res) => {

  try {

    const { id } = req.params;

    const historial = await archiveHistorialService(
      id,
      req.usuario.id
    );

    return res.status(200).json({
      success: true,
      message: "Historial archivado correctamente.",
      data: historial
    });

  } catch (error) {

    console.error(error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  createHistorialController,
  getHistorialByPatrullajeController,
  getHistorialByIdController,
  updateHistorialController,
  archiveHistorialController
};