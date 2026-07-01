const db = require("../database/models");
const { Op } = require("sequelize");

const Gps = db.Gps;
const Usuario = db.Usuario;

// ======================================================
// 1. REGISTRAR POSICIÓN GPS (DESDE MÓVIL)
// ======================================================

const registrarGps = async (req, res) => {
  try {

    const {
      usuario_id,
      latitud,
      longitud,
      velocidad,
      precision,
      fecha_hora,
      tipo
    } = req.body;


    // VALIDACIONES
    if (!usuario_id || !latitud || !longitud) {
      return res.status(400).json({
        message: "usuario_id, latitud y longitud son obligatorios"
      });
    }

    // Validar usuario
    const usuario = await Usuario.findByPk(usuario_id);

    if (!usuario) {
      return res.status(404).json({
        message: "Usuario no encontrado"
      });
    }


    // CREAR REGISTRO GPS
    const gps = await Gps.create({
      usuario_id,
      latitud,
      longitud,
      velocidad,
      precision,
      fecha_hora,
      tipo: tipo || "TRACKING"
    });

    res.status(201).json({
      message: "Coordenada registrada",
      gps
    });

  } catch (error) {
    res.status(500).json({
      message: "Error al registrar GPS",
      error: error.message
    });
  }
};

// ======================================================
// 2. OBTENER ÚLTIMA UBICACIÓN DE UN USUARIO
// ======================================================
const getUltimaUbicacion = async (req, res) => {
  try {

    const { usuario_id } = req.params;

    const gps = await Gps.findOne({
      where: { usuario_id },
      order: [["fecha_hora", "DESC"]]
    });

    if (!gps) {
      return res.status(404).json({
        message: "No hay registros GPS"
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
// 3. HISTORIAL GPS POR USUARIO
// ======================================================
const getHistorialGps = async (req, res) => {
  try {

    const { usuario_id } = req.params;
    const { fecha_inicio, fecha_fin } = req.query;

    let where = { usuario_id };

    if (fecha_inicio && fecha_fin) {
      where.fecha_hora = {
        [Op.between]: [fecha_inicio, fecha_fin]
      };
    }

    const registros = await Gps.findAll({
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
// 4. ULTIMA UBICACION DE TODOS
// ======================================================
const getUltimasUbicaciones = async (req, res) => {
  try {

    const usuarios = await Usuario.findAll({
      include: [
        {
          model: Gps,
          as: "gps_registros",
          limit: 1,
          order: [["fecha_hora", "DESC"]]
        }
      ]
    });

    res.json(usuarios);

  } catch (error) {
    res.status(500).json({
      message: "Error al obtener ubicaciones",
      error: error.message
    });
  }
};

module.exports = {
  registrarGps,
  getUltimaUbicacion,
  getHistorialGps,
  getUltimasUbicaciones
};
