const loginService = require('./login.service');
const registerService = require('./register.service');
const renewTokenService = require('./renewToken.service');
const confirmAccountService = require('./confirmAccount.service');
const recoverAccountService = require('./recoverAccount.service');
const resetPasswordService = require('./resetPassword.service');

module.exports = {
  loginService,
  registerService,
  renewTokenService,
  confirmAccountService,
  recoverAccountService,
  resetPasswordService,
};