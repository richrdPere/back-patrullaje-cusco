const {
  getUsuariosService,
  getUsuarioByIdService,
  createUsuarioService,
  updateUsuarioService,
  changeEstadoUsuarioService,
  deleteUsuarioService,
  getSerenosAndConductoresService
} = require('../services');

/*
|--------------------------------------------------------------------------
| 1. Listar usuarios 
|--------------------------------------------------------------------------
*/
const getUsuariosController = async (req, res) => {

  try {

    const resultado = await getUsuariosService(
      req.query
    );

    return res.status(200).json({
      success: true,
      message: "Usuarios obtenidos correctamente.",
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
| 2. Obtener usuario por ID 
|--------------------------------------------------------------------------
*/
const getUsuarioByIdController = async (req, res) => {

  try {

    const resultado = await getUsuarioByIdService(
      req.params.id
    );

    return res.status(200).json({
      success: true,
      message: "Usuario obtenido correctamente.",
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
| 3. Crear usuario 
|--------------------------------------------------------------------------
*/
const createUsuarioController = async (req, res) => {

  try {

    const resultado = await createUsuarioService(
      req.body
    );

    return res.status(201).json({
      success: true,
      message: "Usuario creado correctamente.",
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
| 4. Actualizar usuario 
|--------------------------------------------------------------------------
*/
const updateUsuarioController = async (req, res) => {

  try {

    await updateUsuarioService(
      req.params.id,
      req.body
    );

    return res.status(200).json({
      success: true,
      message: "Usuario actualizado correctamente."
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
| 5. Cambiar estado de usuario 
|--------------------------------------------------------------------------
*/
const changeEstadoUsuarioController = async (req, res) => {

  try {

    const resultado =
      await changeEstadoUsuarioService(
        req.params.id,
        req.body.estado

      );

    return res.status(200).json({
      success: true,
      message: resultado.estado
        ? "Acceso activado correctamente."
        : "Acceso desactivado correctamente.",
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
| 6. Eliminar usuario 
|--------------------------------------------------------------------------
*/
const deleteUsuarioController = async (req, res) => {

  try {

    await deleteUsuarioService(
      req.params.id
    );

    return res.status(200).json({
      success: true,
      message: "Usuario eliminado correctamente."
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
| 7. Listar serenos y conductores 
|--------------------------------------------------------------------------
*/
const getSerenosAndConductoresController = async (req, res) => {
  try {

    const resultado = await getSerenosAndConductoresService();

    return res.status(200).json({
      success: true,
      total: resultado.length,
      data: resultado
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};
module.exports = {
  getUsuariosController,
  getUsuarioByIdController,
  createUsuarioController,
  updateUsuarioController,
  changeEstadoUsuarioController,
  deleteUsuarioController,
  getSerenosAndConductoresController
};