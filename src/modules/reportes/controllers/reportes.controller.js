const {
  reporteActividadOperativaService,
  reporteIncidenciasService,
  reporteRecorridosService,
  reporteZonasCriticasService,
} = require("../services");

/*
|--------------------------------------------------------------------------
| 1. Obtener reporte de Incidencia
|--------------------------------------------------------------------------
*/
const getReporteIncidenciasController = async (req, res) => {
  try {
    const reporte = await reporteIncidenciasService(req.query);

    return res.status(200).json({
      success: true,
      message: "Reporte de incidencias obtenido correctamente.",
      data: reporte,
    });

  } catch (error) {
    console.error("Error en getReporteIncidenciasController:", error,);
    const statusCode = error.statusCode || 500;

    return res
      .status(statusCode)
      .json({
        success: false,
        message: "No se pudo generar el reporte de incidencias.",
        error: error.message,
      });
  }
};
/*
|--------------------------------------------------------------------------
| 2. Obtener Reporte de Actividad Operativa
|--------------------------------------------------------------------------
*/
const getReporteActividadOperativaController = async (req, res) => {

  try {

    const reporte = await reporteActividadOperativaService(req.query);

    return res.status(200).json({
      success: true,
      message: "Reporte de actividad operativa obtenido correctamente.",
      data: reporte,
    });

  } catch (error) {
    console.error("Error en getReporteActividadOperativaController:", error,);

    const statusCode = error.statusCode || 500;

    return res.status(statusCode).json({
      success: false,
      message: "No se pudo generar el reporte de actividad operativa.",
      error: error.message,
    });
  }
};
/*
|--------------------------------------------------------------------------
| 3. Obtener Reporte de Recorridos
|--------------------------------------------------------------------------
*/
const getReporteRecorridosController = async (req, res) => {
  try {

    const reporte = await reporteRecorridosService();

    return res.status(200).json({
      success: true,
      message: "Reporte de recorridos obtenido correctamente.",
      data: reporte,
    });

  } catch (error) {

    console.error("Error en getReporteRecorridosController:", error,);

    const statusCode = error.statusCode || 500;

    return res.status(statusCode).json({
      success: false,
      message: "No se pudo generar el reporte de recorridos.",
      error: error.message,
    });
  }
};
/*
|--------------------------------------------------------------------------
| 4. Obtener Reporte de Zonas criticas
|--------------------------------------------------------------------------
*/
const getReporteZonasCriticasController = async (req, res) => {
  try {

    const reporte = await reporteZonasCriticasService();

    return res.status(200).json({
      success: true,
      message: "Reporte de zonas críticas obtenido correctamente.",
      data: reporte,
    });

  } catch (error) {

    console.error("Error en getReporteZonasCriticasController:", error,);

    const statusCode = error.statusCode || 500;

    return res.status(statusCode).json({
      success: false,
      message: "No se pudo generar el reporte de zonas críticas.",
      error: error.message,
    });
  }
};

module.exports = {
  getReporteActividadOperativaController,
  getReporteIncidenciasController,
  getReporteRecorridosController,
  getReporteZonasCriticasController,
};