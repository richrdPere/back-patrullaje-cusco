const {
  assignSerenosService,
  getSerenosByUnidadService,
  deleteAsignacionService,
} = require("../services/unidad_sereno");

/*
|--------------------------------------------------------------------------
| 1. Crear Unidad de patrullaje
|--------------------------------------------------------------------------
*/
const assignSerenosController = async (req, res) => {

  try {

    await assignSerenosService(req.body);

    return res.status(200).json({
      success: true,
      message: "Serenos asignados correctamente."
    });

  } catch (error) {

    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};
/*
|--------------------------------------------------------------------------
| 2. Obtener serenos por unidad
|--------------------------------------------------------------------------
*/
const getSerenosByUnidadController = async (req, res) => {

  try {

    const resultado =
      await getSerenosByUnidadService(
        req.params.unidad_id
      );

    return res.status(200).json({
      success: true,
      message: "Serenos obtenidos correctamente.",
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
| 3. Eliminar asignación
|--------------------------------------------------------------------------
*/
const deleteAsignacionController = async (req, res) => {

  try {

    await deleteAsignacionService(
      req.params.unidad_id,
      req.params.usuario_id
    );

    return res.status(200).json({
      success: true,
      message: "Asignación eliminada correctamente."
    });
  } catch (error) {

    return res.status(404).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  assignSerenosController,
  getSerenosByUnidadController,
  deleteAsignacionController
};