const Alerta = require("../models/alerta.model");
const Usuario = require("../models/usuario.model");
const Zonas = require("../models/zonas.model");
const Patrullaje = require("../models/patrullaje_programado.model");

// ======================================================
// CREAR ALERTA
// ======================================================
const crearAlerta = async (req, res) => {
  try {
    const {
      tipo,
      descripcion,
      latitud,
      longitud,
      zona_id,
      patrullaje_id,
    } = req.body;

    const alerta = await Alerta.create({
      tipo,
      descripcion,
      latitud,
      longitud,
      zona_id,
      patrullaje_id,
      usuario_id: req.usuario.id, // viene del JWT
    });

    res.status(201).json({
      message: "Alerta generada correctamente",
      alerta,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al crear alerta",
      error: error.message,
    });
  }
};

// ======================================================
// LISTAR ALERTAS
// ======================================================
const listarAlertas = async (req, res) => {
  try {
    const alertas = await Alerta.findAll({
      include: [
        { model: Usuario, attributes: ["id", "nombre", "apellidos", "rol"] },
        { model: Zonas },
        { model: Patrullaje },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.json(alertas);
  } catch (error) {
    res.status(500).json({
      message: "Error al listar alertas",
      error: error.message,
    });
  }
};

// ======================================================
// OBTENER ALERTA POR ID
// ======================================================
const obtenerAlertaPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const alerta = await Alerta.findByPk(id, {
      include: [
        { model: Usuario, attributes: ["id", "nombre", "apellidos"] },
        { model: Zonas },
        { model: Patrullaje },
      ],
    });

    if (!alerta) {
      return res.status(404).json({ message: "Alerta no encontrada" });
    }

    res.json(alerta);
  } catch (error) {
    res.status(500).json({
      message: "Error al obtener alerta",
      error: error.message,
    });
  }
};

// ======================================================
// ACTUALIZAR ESTADO ALERTA
// ======================================================
const actualizarEstadoAlerta = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    const alerta = await Alerta.findByPk(id);

    if (!alerta) {
      return res.status(404).json({ message: "Alerta no encontrada" });
    }

    alerta.estado = estado;
    await alerta.save();

    res.json({ message: "Estado de alerta actualizado" });
  } catch (error) {
    res.status(500).json({
      message: "Error al actualizar alerta",
      error: error.message,
    });
  }
};

module.exports = {
  crearAlerta,
  listarAlertas,
  obtenerAlertaPorId,
  actualizarEstadoAlerta,
};
