const { getIO } = require("../../../socket");

const {
  createPatrullajePService,
  deletePatrullajePService,
  finishPatrullajePService,
  getPatrullajePByIdService,
  getPatrullajesPAllService,
  getPatrullajesPService,
  getRecorridoPatrullajePService,
  updatePatrullajePService,
} = require("../services/patrullaje_programado");


/*
|--------------------------------------------------------------------------
| 1. Crear Patrullaje programado
|--------------------------------------------------------------------------
*/
const createPatrullajePController = async (req, res) => {

  try {
    const resultado = await createPatrullajePService(req.body);

    try {
      const io = getIO();
      resultado.serenos.forEach(id => {

        io.to(`user_${id}`).emit(
          "nuevo_patrullaje",
          resultado.patrullaje
        );
      });
    } catch (socketError) {
      console.error(socketError);
    }

    return res.status(201).json({
      success: true,
      message: "Patrullaje programado correctamente.",
      data: resultado.patrullaje
    });
  } catch (error) {

    return res.status(400).json({
      success: false,
      message: "No se pudo crear el patrullaje",
      error: error.message
    });
  }
};
/*
|--------------------------------------------------------------------------
| 2. Crear Patrullaje programado
|--------------------------------------------------------------------------
*/
const getPatrullajesPController = async (req, res) => {

  try {

    const resultado = await getPatrullajesPService(req.query);

    return res.status(200).json({
      success: true,
      message: "Patrullajes obtenidos correctamente.",
      data: resultado
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: "No se pudo listar el patrullaje",
      error: error.message
    });
  }
};
/*
|--------------------------------------------------------------------------
| 3. Obtener Patrullaje programado por ID
|--------------------------------------------------------------------------
*/
const getPatrullajePByIdController = async (req, res) => {

  try {

    const resultado = await getPatrullajePByIdService(
      req.params.id
    );

    return res.status(200).json({
      success: true,
      message: "Patrullaje obtenido correctamente.",
      data: resultado
    });

  } catch (error) {

    return res.status(404).json({
      success: false,
      message: "No se pudo obtener el patrullaje",
      error: error.message
    });
  }
};
/*
|--------------------------------------------------------------------------
| 4. Listar todos los patrullajes programados
|--------------------------------------------------------------------------
*/
const getPatrullajesPAllController = async (req, res) => {

  try {

    const resultado = await getPatrullajesPAllService();

    return res.status(200).json({
      success: true,
      message: "Patrullajes obtenidos correctamente.",
      data: resultado

    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: "No se pudo obtener todos los patrullajes",
      error: error.message
    });
  }
};
/*
|--------------------------------------------------------------------------
| 5. Finalizar Patrullaje Programado
|--------------------------------------------------------------------------
*/
const finishPatrullajePController = async (req, res) => {

  try {

    const resultado =
      await finalizarPatrullajeProgramadoService(
        req.params.id
      );

    return res.status(200).json({
      success: true,
      message: "Patrullaje finalizado correctamente.",
      data: resultado
    });

  } catch (error) {

    return res.status(400).json({
      success: false,
      message: "Error al finalizar el patrullaje",
      error: error.message
    });
  }
};
/*
|--------------------------------------------------------------------------
| 6. Actualizar Patrullaje Programado
|--------------------------------------------------------------------------
*/
const updatePatrullajePController = async (req, res) => {

  try {

    const resultado =
      await updatePatrullajePService(
        req.params.id,
        req.body
      );

    return res.status(200).json({
      success: true,
      message: "Patrullaje actualizado correctamente.",
      data: resultado

    });

  } catch (error) {

    return res.status(400).json({
      success: false,
      message: "No se pudo actualizar el patrullaje",
      error: error.message
    });
  }
};
/*
|--------------------------------------------------------------------------
| 7. Actualizar Patrullaje Programado
|--------------------------------------------------------------------------
*/
const deletePatrullajePController = async (req, res) => {

  try {

    await deletePatrullajeProgramadoService(
      req.params.id
    );

    return res.status(200).json({
      success: true,
      message: "Patrullaje eliminado correctamente."
    });

  } catch (error) {

    return res.status(400).json({
      success: false,
      message: "Error al eliminar el patrullaje.",
      error: error.message
    });
  }
};

/*
|--------------------------------------------------------------------------
| 8. Obtener recorrido de un patrullaje programado
|--------------------------------------------------------------------------
*/
const getRecorridoPatrullajePController =
  async (req, res) => {
    try {
      const { patrullajeId } = req.params;

      const data = await getRecorridoPatrullajePService(patrullajeId);

      return res.status(200).json({
        success: true,
        message: "Recorrido obtenido correctamente.",
        data,
      });
    } catch (error) {
      console.error("Error obteniendo recorrido:", error);

      return res.status(400).json({
        success: false,
        message: "No se pudo obtener el recorrido.",
        error: error.message,
      });
    }
  };

module.exports = {
  createPatrullajePController,
  deletePatrullajePController,
  finishPatrullajePController,
  getPatrullajePByIdController,
  getPatrullajesPAllController,
  getPatrullajesPController,
  getRecorridoPatrullajePController,
  updatePatrullajePController,
};