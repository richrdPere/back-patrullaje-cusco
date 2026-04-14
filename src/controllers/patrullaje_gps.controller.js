const db = require('../models');
const { Op } = require("sequelize");

const PatrullajeGps = db.PatrullajeGps;
const PatrullajeProgramado = db.PatrullajeProgramado;

// ======================================================
// 1. REGISTRAR POSICIÓN GPS (DESDE MÓVIL)
// ======================================================
const registrarGpsPatrulla = async (req, res) => {
  try {

    const {
      patrullaje_id,
      latitud,
      longitud,
      velocidad,
      precision,
      fecha_hora,
      tipo
    } = req.body;

    // VALIDACIONES
    if (!patrullaje_id || !latitud || !longitud) {
      return res.status(400).json({
        message: "patrullaje_id, latitud y longitud son obligatorios"
      });
    }

    // Validar existencia de patrullaje
    const patrullaje = await PatrullajeProgramado.findByPk(patrullaje_id);

    if (!patrullaje) {
      return res.status(404).json({
        message: "Patrullaje no encontrado"
      });
    }

    // =========================
    // CREAR REGISTRO
    // =========================
    const gps = await PatrullajeGps.create({
      patrullaje_id,
      latitud,
      longitud,
      velocidad,
      precision,
      fecha_hora,
      tipo: tipo || "TRACKING"
    });

    res.status(201).json({
      message: "Ubicación de patrulla registrada",
      gps
    });

  } catch (error) {
    res.status(500).json({
      message: "Error al registrar GPS de patrulla",
      error: error.message
    });
  }
};

// ======================================================
// 2. OBTENER ÚLTIMA UBICACIÓN DE UN PATRULLAJE
// ======================================================
const getUltimaUbicacionPatrulla = async (req, res) => {
  try {

    const { patrullaje_id } = req.params;

    const gps = await PatrullajeGps.findOne({
      where: { patrullaje_id },
      order: [["fecha_hora", "DESC"]]
    });

    if (!gps) {
      return res.status(404).json({
        message: "No hay registros GPS para esta patrulla"
      });
    }

    res.json(gps);

  } catch (error) {
    res.status(500).json({
      message: "Error al obtener ubicación",
      error: error.message
    });
  }
};


// ======================================================
// 3. HISTORIAL GPS POR PATRULLA
// ======================================================
const getHistorialPatrulla = async (req, res) => {
  try {

    const { patrullaje_id } = req.params;
    const { fecha_inicio, fecha_fin } = req.query;

    let where = { patrullaje_id };

    if (fecha_inicio && fecha_fin) {
      where.fecha_hora = {
        [Op.between]: [fecha_inicio, fecha_fin]
      };
    }

    const registros = await PatrullajeGps.findAll({
      where,
      order: [["fecha_hora", "ASC"]]
    });

    res.json(registros);

  } catch (error) {
    res.status(500).json({
      message: "Error al obtener historial",
      error: error.message
    });
  }
};

// ======================================================
// 4. ULTIMA UBICACION DE TODAS LAS PATRULLAS
// ======================================================
const getUltimasUbicacionesPatrullas = async (req, res) => {
  try {

    const patrullajes = await PatrullajeProgramado.findAll({
      include: [
        {
          model: PatrullajeGps,
          as: "gps",
          limit: 1,
          order: [["fecha_hora", "DESC"]]
        }
      ]
    });

    const data = patrullajes.map(p => {
      const patrullaje = p.toJSON();

      return {
        id: patrullaje.id,
        fecha: patrullaje.fecha,
        estado: patrullaje.estado,
        ubicacion_actual: patrullaje.gps[0] || null
      };
    });

    res.json(data);

  } catch (error) {
    res.status(500).json({
      message: "Error al obtener ubicaciones",
      error: error.message
    });
  }
};


module.exports = {
  registrarGpsPatrulla,
  getUltimaUbicacionPatrulla,
  getHistorialPatrulla,
  getUltimasUbicacionesPatrullas
};
