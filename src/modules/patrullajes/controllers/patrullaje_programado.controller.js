const { getIO } = require("../../../socket");

const {
  createPatrullajePService,
  getPatrullajesPService,
  getPatrullajePByIdService,
  getPatrullajesPAllService,
  finishPatrullajePService,
  updatePatrullajePService,
  deletePatrullajePService
} = require("../services/patrullaje_programado");


/*
|--------------------------------------------------------------------------
| 1. Crear Patrullaje programado
|--------------------------------------------------------------------------
*/
const createPatrullajePController = async (req, res) => {

  try {
    const resultado =
      await createPatrullajePService(
        req.body
      );
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
      message: error.message
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

    const resultado =
      await getPatrullajesPService(
        req.query
      );

    return res.status(200).json({
      success: true,
      message: "Patrullajes obtenidos correctamente.",
      data: resultado
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: error.message
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
      message: error.message
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
      message: error.message
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
      message: error.message
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
      message: error.message
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
      message: error.message
    });
  }
};

module.exports = {
  createPatrullajePController,
  getPatrullajesPController,
  getPatrullajePByIdController,
  getPatrullajesPAllController,
  finishPatrullajePController,
  updatePatrullajePController,
  deletePatrullajePController
};