const loginValidation = (req, res, next) => {

  const {
    username,
    password
  } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      message: "Debe ingresar username y contraseña"
    });
  }

  next();
};

module.exports = loginValidation;