// src/middlewares/rol.middleware.js

/**
 * Middleware para verificar que el usuario tenga un rol permitido.
 * Ejemplo de uso:
 * router.post('/usuarios', verificarToken, verificarRol('admin', 'secretaria'), crearUsuario);
 */

const verificarRol = (...rolesPermitidos) => {
  return (req, res, next) => {
    if (!req.usuario) {
      return res.status(401).json({ message: "Usuario no autenticado" });
    }

    if (!rolesPermitidos.includes(req.usuario.rol)) {
      return res.status(403).json({ message: "Acceso denegado: rol no autorizado" });
    }
    next();
  };
};

module.exports = verificarRol;
