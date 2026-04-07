const Zonas = require("../models/zonas.model");

// ======================================================
// CREAR ZONA
// ======================================================
const crearZona = async (req, res) => {
  try {

    const { nombre, descripcion, coordenadas, riesgo } = req.body;

    if (!nombre) {
      return res.status(400).json({
        message: "El nombre de la zona es obligatorio",
      });
    }

    if (!coordenadas || !Array.isArray(coordenadas) || coordenadas.length < 3) {
      return res.status(400).json({
        message: "La zona debe tener al menos 3 coordenadas",
      });
    }

    const zona = await Zonas.create({
      nombre,
      descripcion,
      coordenadas,
      riesgo
    });

    res.status(201).json({
      message: "Zona creada correctamente",
      zona,
    });

  } catch (error) {

    res.status(500).json({
      message: "Error al crear zona",
      error: error.message,
    });

  }
};

// ======================================================
// LISTAR ZONAS
// ======================================================
const listarZonas = async (req, res) => {
  try {

    const zonas = await Zonas.findAll({
      where: { estado: true },
      order: [["createdAt", "DESC"]],
    });

    // res.json(zonas);

    return res.status(200).json({
      ok: true,
      total: zonas.length,
      zonas
    });

  } catch (error) {

    res.status(500).json({
      message: "Error al listar zonas",
      error: error.message,
    });

  }
};

// ======================================================
// OBTENER ZONA POR ID
// ======================================================
const obtenerZonaPorId = async (req, res) => {
  try {

    const { id } = req.params;

    const zona = await Zonas.findByPk(id);

    if (!zona || zona.estado === false) {
      return res.status(404).json({
        message: "Zona no encontrada"
      });
    }

    res.json(zona);

  } catch (error) {

    res.status(500).json({
      message: "Error al obtener zona",
      error: error.message,
    });

  }
};

// ======================================================
// ACTUALIZAR ZONA
// ======================================================
const actualizarZona = async (req, res) => {
  try {

    const { id } = req.params;

    const zona = await Zonas.findByPk(id);

    if (!zona || zona.estado === false) {
      return res.status(404).json({
        message: "Zona no encontrada"
      });
    }

    const { nombre, descripcion, coordenadas, riesgo } = req.body;

    if (coordenadas && (!Array.isArray(coordenadas) || coordenadas.length < 3)) {
      return res.status(400).json({
        message: "Las coordenadas deben tener al menos 3 puntos"
      });
    }

    await zona.update({
      nombre,
      descripcion,
      coordenadas,
      riesgo
    });

    res.json({
      message: "Zona actualizada correctamente",
      zona
    });

  } catch (error) {

    res.status(500).json({
      message: "Error al actualizar zona",
      error: error.message,
    });

  }
};

// ======================================================
// ELIMINAR ZONA (LÓGICO)
// ======================================================
const eliminarZona = async (req, res) => {
  try {

    const { id } = req.params;

    const zona = await Zonas.findByPk(id);

    if (!zona) {
      return res.status(404).json({
        message: "Zona no encontrada"
      });
    }

    await zona.update({
      estado: false
    });

    res.json({
      message: "Zona eliminada correctamente"
    });

  } catch (error) {

    res.status(500).json({
      message: "Error al eliminar zona",
      error: error.message,
    });

  }
};

// ======================================================
// OBTENER TODAS LAS ZONAS
// ======================================================
const getAllZonas = async (req, res) => {

  try {

    const zonas = await Zonas.findAll({
      order: [["id", "ASC"]]
    });

    return res.status(200).json({
      ok: true,
      total: zonas.length,
      unidades: zonas
    });

  } catch (error) {

    console.error("Error al obtener zonas:", error);

    return res.status(500).json({
      ok: false,
      message: "Error al obtener las zonas de patrullaje",
      error: error.message
    });

  }

};

module.exports = {
  crearZona,
  listarZonas,
  obtenerZonaPorId,
  actualizarZona,
  eliminarZona,
};
