const {
  registerIncidenciaService,
  getIncidenciasPaginatedService,
  getIncidenciaByIdService,
  updateEstadoIncidenciaService,
  deleteIncidenciaService,
  getIncidenciasByUsuarioService,
  getMisIncidenciasService,
  getIncidenciasByPatrullajeService,
  getIncidenciasByZonaService,
  getIncidenciasCercanasService,
  addArchivosIncidenciaService,
  deleteArchivoIncidenciaService,
  getArchivosByIncidenciaService,
  getResumenIncidenciasService,
  getIncidenciasByFechaService,
  updateEstadoMasivoIncidenciasService
} = require("../services");


/*
|--------------------------------------------------------------------------
| 1. Registrar Incidencia
|--------------------------------------------------------------------------
*/
const registerIncidenciaController = async (req, res) => {
  try {
    const usuario_id = req.usuario.id;

    const result = await registerIncidenciaService({
      usuario_id,
      body: req.body,
      files: req.files,
    });

    return res.status(201).json({
      success: true,
      message: "Incidencia registrado correctamente.",
      data: result
    });
  } catch (error) {
    console.error("Error registrar Incidencia:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: "Error al registrar Incidencia.",
      error: error.message,
    });
  }
};
/*
|--------------------------------------------------------------------------
| 2. Listar Incidencias Paginadas
|--------------------------------------------------------------------------
*/
const getIncidenciasPaginatedController = async (req, res) => {
  try {
    const usuarioAuthId = req.usuario?.id || null;

    const result = await getIncidenciasPaginatedService({
      query: req.query,
      usuarioAuthId,
    });

    return res.status(200).json({
      success: true,
      message: "Incidencias obtenidas correctamente.",
      data: result,
    });
  } catch (error) {
    console.error("Error listar Incidencias:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: "Error al listar Incidencias.",
      error: error.message,
    });
  }
};
/*
|--------------------------------------------------------------------------
| 3. Obtener Incidencia por ID
|--------------------------------------------------------------------------
*/
const getIncidenciaByIdController = async (req, res) => {
  try {
    const { id } = req.params;
    const { mode = "app" } = req.query;

    const result = await getIncidenciaByIdService({
      id,
      mode,
    });

    return res.status(200).json({
      success: true,
      message: "Incidencia obtenida correctamente.",
      data: result,
    });
  } catch (error) {
    console.error("Error obtener Incidencia por ID:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: "Error al obtener Incidencia.",
      error: error.message,
    });
  }
};
/*
|--------------------------------------------------------------------------
| 4. Actualizar Estado de Incidencia
|--------------------------------------------------------------------------
*/
const updateEstadoIncidenciaController = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    const result = await updateEstadoIncidenciaService({
      id,
      estado,
    });

    return res.status(200).json({
      success: true,
      message: "Estado de incidencia actualizado correctamente.",
      data: result,
    });
  } catch (error) {
    console.error("Error actualizar Estado de Incidencia:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: "Error al actualizar Estado de Incidencia.",
      error: error.message,
      estadosPermitidos: error.estadosPermitidos,
    });
  }
};
/*
|--------------------------------------------------------------------------
| 5. Eliminar Incidencia
|--------------------------------------------------------------------------
*/
const deleteIncidenciaController = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await deleteIncidenciaService({ id });

    return res.status(200).json({
      success: true,
      message: "Incidencia eliminada correctamente.",
      data: result,
    });
  } catch (error) {
    console.error("Error eliminar Incidencia:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: "Error al eliminar Incidencia.",
      error: error.message,
    });
  }
};
/*
|--------------------------------------------------------------------------
| 6. Obtener Incidencias por Usuario
|--------------------------------------------------------------------------
*/
const getIncidenciasByUsuarioController = async (req, res) => {
  try {
    const { usuario_id } = req.params;

    const result = await getIncidenciasByUsuarioService({
      usuario_id,
      query: req.query,
    });

    return res.status(200).json({
      success: true,
      message: "Incidencias del usuario obtenidas correctamente.",
      data: result,
    });
  } catch (error) {
    console.error("Error obtener Incidencias por Usuario:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: "Error al obtener Incidencias por Usuario.",
      error: error.message,
    });
  }
};
/*
|--------------------------------------------------------------------------
| 7. Obtener Mis Incidencias
|--------------------------------------------------------------------------
*/
const getMisIncidenciasController = async (req, res) => {
  try {
    const usuario_id = req.usuario.id;

    const result = await getMisIncidenciasService({
      usuario_id,
      query: req.query,
    });

    return res.status(200).json({
      success: true,
      message: "Mis incidencias obtenidas correctamente.",
      data: result,
    });
  } catch (error) {
    console.error("Error obtener Mis Incidencias:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: "Error al obtener Mis Incidencias.",
      error: error.message,
    });
  }
};
/*
|--------------------------------------------------------------------------
| 8. Obtener Incidencias por Patrullaje
|--------------------------------------------------------------------------
*/
const getIncidenciasByPatrullajeController = async (req, res) => {
  try {
    const { patrullaje_id } = req.params;

    const result = await getIncidenciasByPatrullajeService({
      patrullaje_id,
      query: req.query,
    });

    return res.status(200).json({
      success: true,
      message: "Incidencias del patrullaje obtenidas correctamente.",
      data: result,
    });
  } catch (error) {
    console.error("Error obtener Incidencias por Patrullaje:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: "Error al obtener Incidencias por Patrullaje.",
      error: error.message,
    });
  }
};
/*
|--------------------------------------------------------------------------
| 9. Obtener Incidencias por Zona
|--------------------------------------------------------------------------
*/
const getIncidenciasByZonaController = async (req, res) => {
  try {
    const { zona_id } = req.params;

    const result = await getIncidenciasByZonaService({
      zona_id,
      query: req.query,
    });

    return res.status(200).json({
      success: true,
      message: "Incidencias de la zona obtenidas correctamente.",
      data: result,
    });
  } catch (error) {
    console.error("Error obtener Incidencias por Zona:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: "Error al obtener Incidencias por Zona.",
      error: error.message,
    });
  }
};
/*
|--------------------------------------------------------------------------
| 10. Obtener Incidencias Cercanas
|--------------------------------------------------------------------------
*/
const getIncidenciasCercanasController = async (req, res) => {
  try {
    const result = await getIncidenciasCercanasService({
      query: req.query,
    });

    return res.status(200).json({
      success: true,
      message: "Incidencias cercanas obtenidas correctamente.",
      data: result,
    });
  } catch (error) {
    console.error("Error obtener Incidencias Cercanas:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: "Error al obtener Incidencias Cercanas.",
      error: error.message,
    });
  }
};
/*
|--------------------------------------------------------------------------
| 11. Agregar Archivos a Incidencia
|--------------------------------------------------------------------------
*/
const addArchivosIncidenciaController = async (req, res) => {
  try {
    const { id } = req.params;
    const usuario_id = req.usuario.id;

    const result = await addArchivosIncidenciaService({
      incidencia_id: id,
      usuario_id,
      files: req.files,
    });

    return res.status(201).json({
      success: true,
      message: "Archivos agregados correctamente a la incidencia.",
      data: result,
    });
  } catch (error) {
    console.error("Error agregar Archivos a Incidencia:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: "Error al agregar Archivos a Incidencia.",
      error: error.message,
    });
  }
};
/*
|--------------------------------------------------------------------------
| 12. Eliminar Archivo de Incidencia
|--------------------------------------------------------------------------
*/
const deleteArchivoIncidenciaController = async (req, res) => {
  try {
    const { id, archivo_id } = req.params;

    const result = await deleteArchivoIncidenciaService({
      incidencia_id: id,
      archivo_id,
    });

    return res.status(200).json({
      success: true,
      message: "Archivo de incidencia eliminado correctamente.",
      data: result,
    });
  } catch (error) {
    console.error("Error eliminar Archivo de Incidencia:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: "Error al eliminar Archivo de Incidencia.",
      error: error.message,
    });
  }
};
/*
|--------------------------------------------------------------------------
| 13. Obtener Archivos de Incidencia
|--------------------------------------------------------------------------
*/
const getArchivosByIncidenciaController = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await getArchivosByIncidenciaService({
      incidencia_id: id,
      query: req.query,
    });

    return res.status(200).json({
      success: true,
      message: "Archivos de incidencia obtenidos correctamente.",
      data: result,
    });
  } catch (error) {
    console.error("Error obtener Archivos de Incidencia:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: "Error al obtener Archivos de Incidencia.",
      error: error.message,
    });
  }
};
/*
|--------------------------------------------------------------------------
| 14. Resumen Estadístico de Incidencias
|--------------------------------------------------------------------------
*/
const getResumenIncidenciasController = async (req, res) => {
  try {
    const result = await getResumenIncidenciasService({
      query: req.query,
    });

    return res.status(200).json({
      success: true,
      message: "Resumen estadístico de incidencias obtenido correctamente.",
      data: result,
    });
  } catch (error) {
    console.error("Error obtener Resumen de Incidencias:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: "Error al obtener Resumen de Incidencias.",
      error: error.message,
    });
  }
};
/*
|--------------------------------------------------------------------------
| 15. Obtener Incidencias por Rango de Fechas
|--------------------------------------------------------------------------
*/
const getIncidenciasByFechaController = async (req, res) => {
  try {
    const result = await getIncidenciasByFechaService({
      query: req.query,
    });

    return res.status(200).json({
      success: true,
      message: "Incidencias por rango de fechas obtenidas correctamente.",
      data: result,
    });
  } catch (error) {
    console.error("Error obtener Incidencias por Fecha:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: "Error al obtener Incidencias por Fecha.",
      error: error.message,
    });
  }
};
/*
|--------------------------------------------------------------------------
| 16. Cambiar Estado Masivo de Incidencias
|--------------------------------------------------------------------------
*/
const updateEstadoMasivoIncidenciasController = async (req, res) => {
  try {
    const { ids, estado } = req.body;

    const result = await updateEstadoMasivoIncidenciasService({
      ids,
      estado,
    });

    return res.status(200).json({
      success: true,
      message: "Estado masivo de incidencias actualizado correctamente.",
      data: result,
    });
  } catch (error) {
    console.error("Error actualizar Estado Masivo de Incidencias:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: "Error al actualizar Estado Masivo de Incidencias.",
      error: error.message,
      estadosPermitidos: error.estadosPermitidos,
    });
  }
};
module.exports = {
  addArchivosIncidenciaController,
  deleteArchivoIncidenciaController,
  deleteIncidenciaController,
  getArchivosByIncidenciaController,
  getIncidenciaByIdController,
  getIncidenciasByFechaController,
  getIncidenciasByPatrullajeController,
  getIncidenciasByUsuarioController,
  getIncidenciasByZonaController,
  getIncidenciasCercanasController,
  getIncidenciasPaginatedController,
  getMisIncidenciasController,
  getResumenIncidenciasController,
  registerIncidenciaController,
  updateEstadoIncidenciaController,
  updateEstadoMasivoIncidenciasController
};