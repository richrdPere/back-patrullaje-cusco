const {
  loginService,
  registerService,
  renewTokenService,
  confirmAccountService,
  recoverAccountService,
  resetPasswordService,
} = require("../services/auth");

/*
|--------------------------------------------------------------------------
| 1. Login 
|--------------------------------------------------------------------------
*/
const loginController = async (req, res) => {
  try {
    const resultado = await loginService(req.body);

    return res.status(200).json({
      success: true,
      message: "Login exitoso.",
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
| 2. Register 
|--------------------------------------------------------------------------
*/
const registerController = async (req, res) => {
  try {
    const resultado = await registerService(req.body);

    return res.status(201).json({
      success: true,
      message: "Usuario registrado correctamente.",
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
| 3. Renew Token 
|--------------------------------------------------------------------------
*/
const renewTokenController = async (req, res) => {
  try {

    const resultado = await renewTokenService(req.usuario.id);

    return res.status(200).json({
      success: true,
      message: "Token renovado correctamente.",
      data: resultado
    });

  } catch (error) {

    return res.status(401).json({
      success: false,
      message: error.message
    });

  }
};
/*
|--------------------------------------------------------------------------
| 4. Confirm Account 
|--------------------------------------------------------------------------
*/
const confirmAccountController = async (req, res) => {
  try {

    await confirmAccountService(req.params.token);

    return res.status(200).json({
      success: true,
      message: "Cuenta confirmada correctamente."
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
| 5. Recover Account 
|--------------------------------------------------------------------------
*/
const recoverAccountController = async (req, res) => {
  try {

    const { username } = req.body;

    const resultado = await recoverAccountService(username);

    return res.status(200).json({
      success: true,
      message: "Token de recuperación generado correctamente.",
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
| 6. Reset Password 
|--------------------------------------------------------------------------
*/
const resetPasswordController = async (req, res) => {

  try {

    const { token, nuevaPassword } = req.body;

    await resetPasswordService(
      token,
      nuevaPassword
    );

    return res.status(200).json({
      success: true,
      message: "Contraseña actualizada correctamente."
    });

  } catch (error) {

    return res.status(400).json({
      success: false,
      message: error.message
    });

  }

};

module.exports = {
  loginController,
  registerController,
  renewTokenController,
  confirmAccountController,
  recoverAccountController,
  resetPasswordController
};