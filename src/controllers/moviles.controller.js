const db = require('../models');
const { Op } = require("sequelize");

const PatrullajeProgramado = db.PatrullajeProgramado;
const PatrullajePersonal = db.PatrullajePersonal;
const UnidadPatrullaje = db.UnidadPatrullaje;
const Gps = db.Gps;
const Usuario = db.Usuario;
const Roles = db.Roles;
const Policia = db.Policia;
const Zonas = db.Zonas;

// ======================================================
// 1. OBTENER PATRULLAJE ACTIVO
// ======================================================
const getPatrullajeActivoMobile = async (req, res) => {
  try {
    const serenoId = req.usuario.id;

    const patrullaje = await PatrullajeProgramado.findOne({
      include: [
        {
          model: Zonas,
          as: "zona",
          attributes: ['nombre', 'riesgo', 'coordenadas', 'descripcion']
        },
        {
          model: UnidadPatrullaje,
          as: "unidad",
          attributes: ['codigo', 'tipo', 'placa']
        }
      ],
      where: {
        estado: {
          [Op.in]: ['PROGRAMADO', 'EN_CURSO']
        }
      }
    });

    if (!patrullaje) return res.json(null);

    const pertenece = await PatrullajePersonal.findOne({
      where: {
        patrullaje_id: patrullaje.id,
        personal_id: serenoId,
        tipo_personal: 'SERENO'
      }
    });

    if (!pertenece) return res.json(null);

    return res.status(200).json({
      data: {
        id: patrullaje.id,
        fecha: patrullaje.fecha,
        hora_inicio: patrullaje.hora_inicio,
        hora_fin: patrullaje.hora_fin,
        estado: patrullaje.estado,
        zona: {
          nombre: patrullaje.zona?.nombre,
          descripcion: patrullaje.zona?.descripcion,
          riesgo: patrullaje.zona?.riesgo,
          coordenadas: patrullaje.zona?.coordenadas
        },
        unidad: {
          codigo: patrullaje.unidad?.codigo,
          tipo: patrullaje.unidad?.tipo,
          placa: patrullaje.unidad?.placa,
        }
      },
      message: "OK"
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error al obtener el patrullaje activo",
      error: error.message
    });
  }
};

// ======================================================
// 2. INICIAR PATRULLAJE
// ======================================================
const startPatrullaje = async (req, res) => {
  try {
    const { id } = req.params;
    const usuarioId = req.usuario.id;

    // 1. Buscar patrullaje
    const patrullaje = await PatrullajeProgramado.findByPk(id, {
      include: [
        {
          model: PatrullajePersonal,
          as: "personal",
          where: {
            personal_id: usuarioId,
            tipo_personal: "SERENO"
          },
          required: true
        }
      ]
    });

    if (!patrullaje) {
      return res.status(404).json({
        message: "Patrullaje no encontrado o no autorizado"
      });
    }

    // 2. Validar estado
    if (patrullaje.estado !== "PROGRAMADO") {
      return res.status(400).json({
        message: "El patrullaje no está en estado PROGRAMADO"
      });
    }

    // 3. Actualizar estado
    patrullaje.estado = "EN_CURSO";
    await patrullaje.save();

    res.json({
      message: "Patrullaje iniciado correctamente",
      patrullaje
    });

  } catch (error) {
    res.status(500).json({
      message: "Error al iniciar patrullaje",
      error: error.message
    });
  }
};

// ======================================================
// 3. FINALIZAR PATRULLAJE
// ======================================================
const endPatrullaje = async (req, res) => {
  try {
    const { id } = req.params;
    const usuarioId = req.usuario.id;

    const patrullaje = await PatrullajeProgramado.findByPk(id, {
      include: [
        {
          model: PatrullajePersonal,
          as: "personal",
          where: {
            personal_id: usuarioId,
            tipo_personal: "SERENO"
          },
          required: true
        }
      ]
    });

    if (!patrullaje) {
      return res.status(404).json({
        message: "Patrullaje no encontrado o no autorizado"
      });
    }

    if (patrullaje.estado !== "EN_CURSO") {
      return res.status(400).json({
        message: "El patrullaje no está en curso"
      });
    }

    patrullaje.estado = "FINALIZADO";
    await patrullaje.save();

    res.json({
      message: "Patrullaje finalizado correctamente",
      patrullaje
    });

  } catch (error) {
    res.status(500).json({
      message: "Error al finalizar patrullaje",
      error: error.message
    });
  }
};

// ======================================================
// 4. ENVIAR UBICACION
// ======================================================
const sendLocation = async (req, res) => {
  try {
    const {
      latitud,
      longitud,
      velocidad,
      precision,
      tipo
    } = req.body;

    const usuarioId = req.usuario.id;

    // 1. Buscar patrullaje activo del usuario
    const patrullaje = await PatrullajeProgramado.findOne({
      include: [
        {
          model: PatrullajePersonal,
          as: "personal",
          where: {
            personal_id: usuarioId,
            tipo_personal: "SERENO"
          },
          required: true
        }
      ],
      where: {
        estado: "EN_CURSO"
      }
    });

    if (!patrullaje) {
      return res.status(400).json({
        message: "No tienes un patrullaje en curso"
      });
    }

    // 2. Guardar ubicación
    const registro = await Gps.create({
      usuario_id: usuarioId,
      latitud,
      longitud,
      velocidad: velocidad || null,
      precision: precision || null,
      tipo: tipo || "TRACKING",
      fecha_hora: new Date()
    });

    // 3. Respuesta
    res.json({
      message: "Ubicación registrada correctamente",
      data: {
        id: registro.id,
        latitud: registro.latitud,
        longitud: registro.longitud,
        fecha_hora: registro.fecha_hora
      }
    });

  } catch (error) {
    console.error("Error GPS:", error);

    res.status(500).json({
      message: "Error al registrar ubicación",
      error: error.message
    });
  }
};

module.exports = {
  getPatrullajeActivoMobile,
  startPatrullaje,
  endPatrullaje,
  sendLocation
}