const {
  getMyProfileService,
  changePasswordService,
  updateMyProfileService,
  uploadProfilePhotoService,
} = require("../services/profile");

/*
|--------------------------------------------------------------------------
| 1. Obtener perfil 
|--------------------------------------------------------------------------
*/
const getMyProfileController = async (req, res) => {

  try {

    const resultado = await getMyProfileService(req.usuario.id);

    return res.status(200).json({
      success: true,
      message: "Perfil obtenido correctamente.",
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
| 2. Cambiar contraseña desde perfil 
|--------------------------------------------------------------------------
*/
const changePasswordController = async (req, res) => {

  try {

    const resultado = await changePasswordService({
      usuarioId: req.usuario.id,
      ...req.body
    });

    return res.status(200).json({
      success: true,
      message: resultado.message
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
| 3. Cambiar contraseña desde perfil 
|--------------------------------------------------------------------------
*/
const updateMyProfileController = async (req, res) => {

  try {

    const resultado = await updateMyProfileService({
      usuarioId: req.usuario.id,
      ...req.body
    });

    return res.status(200).json({
      success: true,
      message: resultado.message,
      data: resultado.usuario
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
| 4. Actualizar foto de perfil 
|--------------------------------------------------------------------------
*/
const uploadProfilePhotoController = async (req, res) => {

  try {

    const resultado = await uploadProfilePhotoService({
      usuarioId: req.usuario.id,
      file: req.file
    });

    return res.status(200).json({
      success: true,
      message: resultado.message,
      data: {
        foto_perfil: resultado.foto_perfil
      }
    });

  } catch (error) {

    return res.status(400).json({
      success: false,
      message: error.message
    });

  }
};

module.exports = {
  getMyProfileController,
  changePasswordController,
  updateMyProfileController,
  uploadProfilePhotoController
};