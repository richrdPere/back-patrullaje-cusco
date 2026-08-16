const {
  archiveHistorialService,
  createHistorialService,
  getHistorialByIdService,
  getHistorialByPatrullajeService,
  getHistorialPaginadoService,
  updateHistorialService,
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
      message: "No se pudo crear el historial",
      error: error.message
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

    const patrullajeId = Number(req.params.id);

    if (!Number.isInteger(patrullajeId) || patrullajeId <= 0) {
      return res.status(400).json({
        success: false,
        message: "El identificador del patrullaje no es válido.",
        error: "El parámetro id debe ser un número entero positivo."
      });
    }

    const historial = await getHistorialByPatrullajeService(patrullajeId);

    return res.status(200).json({
      success: true,
      message: "Historial obtenido correctamente.",
      data: historial
    });

  } catch (error) {

    console.error(error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: "No se pudo obtener el historial del patrullaje.",
      error: error.message
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
      message: "No se pudo obtener el historial.",
      error: error.message
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
      message: "No se pudo actualizar el historial.",
      error: error.message
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
      message: "No se pudo archivar el historial.",
      error: error.message
    });
  }
};
/*
|--------------------------------------------------------------------------
| 6. Obtener historial paginado
|--------------------------------------------------------------------------
*/
const getHistorialPaginadoController = async (req, res) => {
  try {
    const result = await getHistorialPaginadoService(req.query);

    return res.status(200).json({
      success: true,
      message: "Historial de patrullajes obtenido correctamente.",
      data: result,
    });
  } catch (error) {
    console.error("Error en getHistorialPaginadoController:", error);

    return res.status(500).json({
      success: false,
      message: "No se pudo obtener el historial de patrullajes.",
      error: error.message,
    });
  }
};

module.exports = {
  archiveHistorialController,
  createHistorialController,
  getHistorialByIdController,
  getHistorialByPatrullajeController,
  getHistorialPaginadoController,
  updateHistorialController,
};