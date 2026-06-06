const registerValidation = (req, res, next) => {

  const {
    nombre,
    apellidos,
    password,
    documento_identidad
  } = req.body;

  if (
    !nombre ||
    !apellidos ||
    !password ||
    !documento_identidad
  ) {
    return res.status(400).json({
      message:
        "Los campos obligatorios no fueron enviados"
    });
  }

  next();
};

module.exports = registerValidation;