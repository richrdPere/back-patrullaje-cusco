const { confirmAccountService } = require('../services');

const confirmAccountController = async (req, res) => {


  try {
    const result = await confirmAccountService(req.params.token);
    return res.status(200).json(result);
  }

  catch (error) {
    return res.status(
      error.status || 500)
      .json({ message: error.message });
  }

};


module.exports = confirmAccountController;