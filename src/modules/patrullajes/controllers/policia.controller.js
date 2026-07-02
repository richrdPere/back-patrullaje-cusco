const {
  createPoliciaService,
  getPoliciasService,
  getPoliciaByIdService,
  updatePoliciaService,
  deletePoliciaService,
  getPoliciasAllService,
} = require('../services/policia');

/*
|--------------------------------------------------------------------------
| 1. Crear policía
|--------------------------------------------------------------------------
*/
const createPoliciaController = async (req, res) => {
  try {

    const result = await createPoliciaService(req.body);

    if (!result.ok) {
      return res.status(result.status).json({
        success: false,
        message: result.message
      });
    }

    return res.status(201).json({
      success: true,
      message: "Policía creado correctamente",
      data: result.data
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: "Error al crear policía",
      error: error.message
    });

  }
};
/*
|--------------------------------------------------------------------------
| 2. Listar policías
|--------------------------------------------------------------------------
*/
const getPoliciasController = async (req, res) => {
  try {

    const result = await getPoliciasService(req.query);

    return res.status(200).json({
      success: true,
      message: "Policias obtenidos correctamente.",
      data: result
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: "Error al listar policías",
      error: error.message
    });

  }
};
/*
|--------------------------------------------------------------------------
| 3. Obtener policía por ID
|--------------------------------------------------------------------------
*/
const getPoliciaByIdController = async (req, res) => {
  try {

    const { id } = req.params;

    const policia = await getPoliciaByIdService(id);

    if (!policia) {
      return res.status(404).json({
        success: false,
        message: "Policía no encontrado"
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        id: policia.id,
        grado: policia.grado,
        comisaria: policia.comisaria,
        codigo_institucional: policia.codigo_institucional,
        persona: policia.persona
      }
    });

  } catch (error) {

    console.error("❌ Error al obtener policía:", error);

    return res.status(500).json({
      success: false,
      message: "Error al obtener policía",
      error: error.message
    });

  }
};
/*
|--------------------------------------------------------------------------
| 4. Actualizar policía
|--------------------------------------------------------------------------
*/
const updatePoliciaController = async (req, res) => {
  try {

    const { id } = req.params;

    const result = await updatePoliciaService(id, req.body);

    if (!result.ok) {
      return res.status(result.status).json({
        success: false,
        message: result.message
      });
    }

    return res.status(200).json({
      success: true,
      message: result.message
    });

  } catch (error) {

    console.error("❌ Error al actualizar policía:", error);

    return res.status(500).json({
      success: false,
      message: "Error al actualizar policía",
      error: error.message
    });

  }
};
/*
|--------------------------------------------------------------------------
| 5. Eliminar policía
|--------------------------------------------------------------------------
*/
const deletePoliciaController = async (req, res) => {
  try {

    const { id } = req.params;

    const result = await deletePoliciaService(id);

    if (!result.ok) {
      return res.status(result.status).json({
        success: false,
        message: result.message
      });
    }

    return res.status(200).json({
      success: true,
      message: result.message
    });

  } catch (error) {

    console.error("❌ Error al eliminar policía:", error);

    return res.status(500).json({
      success: false,
      message: "Error al eliminar policía",
      error: error.message
    });

  }
};

/*
|--------------------------------------------------------------------------
| 6. Listar todos los policías
|--------------------------------------------------------------------------
*/
const getPoliciasAllController = async (req, res) => {
  try {

    const data = await getPoliciasAllService();

    return res.status(200).json({
      success: true,
      total: data.length,
      data
    });

  } catch (error) {

    console.error("❌ Error al listar policías:", error);

    return res.status(500).json({
      success: false,
      message: "Error al listar policías",
      error: error.message
    });

  }
};

module.exports = {
  createPoliciaController,
  getPoliciasController,
  getPoliciaByIdController,
  updatePoliciaController,
  deletePoliciaController,
  getPoliciasAllController
};