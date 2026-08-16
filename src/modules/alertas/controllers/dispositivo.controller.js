const {
  registerDispositivoService,
  desactivarDispositivoService
} = require("../services/dispositivos")

/*
|--------------------------------------------------------------------------
| 1. Registrar dispositivo 
|--------------------------------------------------------------------------
*/
const registerDispositivoController = async (
  req,
  res
) => {
  try {
    const dispositivo =
      await registerDispositivoService({
        usuario_id: req.usuario.id,
        body: req.body,
      });

    return res.status(200).json({
      success: true,
      message: "Dispositivo registrado correctamente",
      data: dispositivo,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "No se pudo registrar el dispositivo",
      error: error.message,
    });
  }
};
/*
|--------------------------------------------------------------------------
| 2. Desactivar dispositivo 
|--------------------------------------------------------------------------
*/
const desactivarDispositivoController = async (
  req,
  res
) => {
  try {
    const usuario_id = req.usuario.id;

    const resultado =
      await desactivarDispositivoService({
        usuario_id,
        body: req.body,
      });

    return res.status(200).json({
      success: true,
      message: resultado.ya_desactivado
        ? "El dispositivo ya se encontraba desactivado"
        : "Dispositivo desactivado correctamente",
      data: resultado,
    });
  } catch (error) {
    console.error("Error al desactivar dispositivo:", error);

    if (
      error.message ===
      "El dispositivo solicitado no se encuentra registrado para este usuario"
    ) {
      return res.status(404).json({
        success: false,
        message: "No se pudo desactivar el dispositivo",
        error: error.message,
      });
    }

    return res.status(400).json({
      success: false,
      message: "No se pudo desactivar el dispositivo",
      error: error.message,
    });
  }
};
module.exports = {
  registerDispositivoController,
  desactivarDispositivoController
}