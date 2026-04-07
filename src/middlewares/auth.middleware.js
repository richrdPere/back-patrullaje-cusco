const jwt = require("jsonwebtoken");

const verificarToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    return res.status(403).json({ message: "No se proporcionó un token" });
  }

  try {
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.slice(7)
      : authHeader;

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.usuario = decoded;
    req.token = token; // opcional (útil si luego lo necesitas)

    next();
  } catch (error) {
    return res.status(401).json({
      message: error.name === "TokenExpiredError"
        ? "Token expirado"
        : "Token inválido",
    });
  }
};

module.exports = verificarToken;