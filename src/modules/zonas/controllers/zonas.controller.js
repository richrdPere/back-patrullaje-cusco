const {
  createZonaService,
  getZonasService,
  getZonaByIdService,
  updateZonaService,
  deleteZonaService,
} = require('../services');

/*
|--------------------------------------------------------------------------
| 1. Crear zona
|--------------------------------------------------------------------------
*/
const createZonaController = async (req, res) => {
  try {

    const { nombre, descripcion, coordenadas, riesgo } = req.body;

    // ==========================
    // VALIDACIONES
    // ==========================
    if (!nombre) {
      return res.status(400).json({
        success: false,
        message: "El nombre de la zona es obligatorio",
      });
    }

    if (!coordenadas || !Array.isArray(coordenadas) || coordenadas.length < 3) {
      return res.status(400).json({
        success: false,
        message: "La zona debe tener al menos 3 coordenadas",
      });
    }

    // ==========================
    // SERVICE
    // ==========================
    const zona = await createZonaService({
      nombre,
      descripcion,
      coordenadas,
      riesgo
    });

    return res.status(200).json({
      success: true,
      message: "Zona creada correctamente",
      data: zona,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};
/*
|--------------------------------------------------------------------------
| 2. Obtener zonas
|--------------------------------------------------------------------------
*/
const getZonasController = async (req, res) => {
  try {

    const zonas = await getZonasService();

    return res.status(200).json({
      success: true,
      message: "Zonas obtenidas correctamente.",
      total: zonas.length,
      data: zonas
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error al listar zonas",
      error: error.message,
    });

  }
};
/*
|--------------------------------------------------------------------------
| 3. Obtener zona por ID
|--------------------------------------------------------------------------
*/
const getZonaByIdController = async (req, res) => {
  try {

    const { id } = req.params;

    const zona = await getZonaByIdService(id);

    if (!zona) {
      return res.status(404).json({
        success: false,
        message: "Zona no encontrada"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Zona obtenido correctamente.",
      data: zona
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: "Error al obtener zona",
      error: error.message,
    });
  }
};
/*
|--------------------------------------------------------------------------
| 4. Actualizar zona
|--------------------------------------------------------------------------
*/
const updateZonaController = async (req, res) => {
  try {

    const { id } = req.params;
    const { nombre, descripcion, coordenadas, riesgo } = req.body;

    // VALIDACIÓN DE COORDENADAS
    if (coordenadas && (!Array.isArray(coordenadas) || coordenadas.length < 3)) {
      return res.status(400).json({
        success: false,
        message: "Las coordenadas deben tener al menos 3 puntos"
      });
    }

    // SERVICE
    const zona = await updateZonaService(id, {
      nombre,
      descripcion,
      coordenadas,
      riesgo
    });

    if (!zona) {
      return res.status(404).json({
        success: false,
        message: "Zona no encontrada"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Zona actualizada correctamente",
      data: zona
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: "Error al actualizar zona",
      error: error.message,
    });

  }
};
/*
|--------------------------------------------------------------------------
| 5. Eliminar zona
|--------------------------------------------------------------------------
*/
const deleteZonaController = async (req, res) => {
  try {

    const { id } = req.params;

    const eliminado = await deleteZonaService(id);

    if (!eliminado) {
      return res.status(404).json({
        success: false,
        message: "Zona no encontrada"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Zona eliminada correctamente"
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: "Error al eliminar zona",
      error: error.message,
    });

  }
};
module.exports = {
  createZonaController,
  getZonasController,
  getZonaByIdController,
  updateZonaController,
  deleteZonaController
};