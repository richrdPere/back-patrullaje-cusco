const loginController = require('./login.controller');
const registerController = require('./register.controller');
const renewTokenController = require('./renewToken.controller');
const confirmAccountController = require('./confirmAccount.controller');
const recoverAccountController = require('./recoverAccount.controller');
const resetPasswordController = require('./resetPassword.controller');

module.exports = {
  loginController,
  registerController,
  renewTokenController,
  confirmAccountController,
  recoverAccountController,
  resetPasswordController,
};