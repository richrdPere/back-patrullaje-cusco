const { loginService } = require("../services");

const loginController = async (req, res) => {

  try {
    const result = await loginService(req.body);
    return res.status(200).json(result);

  } catch (error) {

    return res.status(error.status || 500)
      .json({
        message: error.message
      });
  }
};

module.exports = loginController;