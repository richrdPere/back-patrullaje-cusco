const {
  getPatrullajeActivoService,
  startPatrullajeService,
  endPatrullajeService,
  sendLocationService
} = require("../services/patrullaje_movil");

/*
|--------------------------------------------------------------------------
| 1. Obtener Patrullaje activo
|--------------------------------------------------------------------------
*/
const getPatrullajeActivoController = async (req, res) => {

  try {

    const usuarioId = req.usuario.id;

    console.log("USUARIO ID: ", usuarioId);

    const patrullaje = await getPatrullajeActivoService(usuarioId);

    if (!patrullaje) {
      return res.status(200).json({
        success: true,
        message: "No existe un patrullaje activo.",
        data: null,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Patrullaje activo obtenido correctamente.",
      data: patrullaje,
    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Error al obtener el patrullaje activo.",
      error: error.message,
    });
  }
};
/*
|--------------------------------------------------------------------------
| 2. Comenzar patrullaje
|--------------------------------------------------------------------------
*/
const startPatrullajeController = async (req, res) => {

  try {

    const { id } = req.params;
    const usuarioId = req.usuario.id;

    const patrullaje = await startPatrullajeService(id, usuarioId);

    return res.status(200).json({
      success: true,
      message: "Patrullaje iniciado correctamente.",
      data: patrullaje
    });

  } catch (error) {

    console.error(error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Error al iniciar el patrullaje."
    });
  }
};
/*
|--------------------------------------------------------------------------
| 3. Finalizar patrullaje
|--------------------------------------------------------------------------
*/
const endPatrullajeController = async (req, res) => {
  try {
    const patrullajeId = Number(req.params.id);
    const usuarioId = req.usuario.id;

    const observacionFinal =
      req.body?.observacion_final?.trim() || null;

    if (
      !Number.isInteger(patrullajeId) ||
      patrullajeId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "El identificador del patrullaje no es válido.",
      });
    }

    const patrullaje = await endPatrullajeService(
      patrullajeId,
      usuarioId,
      observacionFinal,
    );

    return res.status(200).json({
      success: true,
      message: "Patrullaje finalizado correctamente.",
      data: patrullaje,
    });
  } catch (error) {
    console.error(
      "Error al finalizar patrullaje:",
      error,
    );

    return res.status(error.statusCode || 500).json({
      success: false,
      message:
        error.message ||
        "Error al finalizar el patrullaje.",
    });
  }
};
/*
|--------------------------------------------------------------------------
| 4. Enviar locación
|--------------------------------------------------------------------------
*/
const sendLocationController = async (req, res) => {

  try {

    const usuarioId = req.usuario.id;

    const location = await sendLocationService(
      usuarioId,
      req.body
    );

    return res.status(201).json({
      success: true,
      message: "Ubicación registrada correctamente.",
      data: location
    });

  } catch (error) {

    console.error(error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Error al registrar la ubicación."
    });
  }
};

module.exports = {
  getPatrullajeActivoController,
  startPatrullajeController,
  endPatrullajeController,
  sendLocationController
};