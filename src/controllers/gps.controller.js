const Gps = require("../models/gps.model");

// ======================================================
// REGISTRAR POSICIÓN GPS (DESDE MÓVIL)
// ======================================================
const registrarGps = async (req, res) => {
  try {
    const { latitud, longitud, velocidad, precision } = req.body;
    const usuario_id = req.usuario.id;

    const gps = await Gps.create({
      usuario_id,
      latitud,
      longitud,
      velocidad,
      precision,
    });

    res.status(201).json({
      message: "Ubicación GPS registrada",
      gps,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al registrar GPS",
      error: error.message,
    });
  }
};

// ======================================================
// OBTENER ÚLTIMA UBICACIÓN DE UN USUARIO
// ======================================================
const obtenerUltimaUbicacion = async (req, res) => {
  try {
    const { usuarioId } = req.params;

    const gps = await Gps.findOne({
      where: { usuario_id: usuarioId },
      order: [["fecha_hora", "DESC"]],
    });

    if (!gps) {
      return res.status(404).json({ message: "Sin registros GPS" });
    }

    res.json(gps);
  } catch (error) {
    res.status(500).json({
      message: "Error al obtener ubicación",
      error: error.message,
    });
  }
};

// ======================================================
// HISTORIAL GPS POR USUARIO
// ======================================================
const listarHistorialGps = async (req, res) => {
  try {
    const { usuarioId } = req.params;

    const historial = await Gps.findAll({
      where: { usuario_id: usuarioId },
      order: [["fecha_hora", "DESC"]],
    });

    res.json(historial);
  } catch (error) {
    res.status(500).json({
      message: "Error al listar historial GPS",
      error: error.message,
    });
  }
};

module.exports = {
  registrarGps,
  obtenerUltimaUbicacion,
  listarHistorialGps,
};
