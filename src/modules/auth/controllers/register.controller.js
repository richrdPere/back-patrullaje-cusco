const { registerService } = require("../services");

const registerController = async (req, res) => {

  try {
    const result = await registerService(req.body);
    return res.status(201).json(result);

  } catch (error) {

    return res.status(error.status || 500)
      .json({
        message: error.message
      });
  }
};

module.exports = registerController;