const db = require("../database/models");

const HistorialPatrullaje = db.HistorialPatrullaje;
const PatrullajeProgramado = db.PatrullajeProgramado;
const Usuario = db.Usuario;
const Persona = db.Persona;
const Zonas = db.Zonas;
const Incidencia = db.Incidencia;
const IncidenciaArchivo = db.IncidenciaArchivo;

// ======================================================
// REGISTRAR HISTORIAL
// ======================================================
const registerHistorial = async (req, res) => {
  try {

    const usuario_id = req.usuario.id;

    const {
      patrullaje_id,
      tipo,
      titulo,
      descripcion,
      prioridad,
      latitud,
      longitud,
      visible_para_siguiente_turno
    } = req.body;

    if (!patrullaje_id) {
      return res.status(400).json({
        ok: false,
        msg: "El patrullaje es obligatorio"
      });
    }

    const patrullaje = await PatrullajeProgramado.findByPk(
      patrullaje_id
    );

    if (!patrullaje) {
      return res.status(404).json({
        ok: false,
        msg: "Patrullaje no encontrado"
      });
    }

    const zona_id = patrullaje.zona_id;

    const zona = await Zonas.findByPk(zona_id);

    if (!zona) {
      return res.status(404).json({
        ok: false,
        msg: "Zona no encontrada"
      });
    }

    if (!titulo || !descripcion) {
      return res.status(400).json({
        ok: false,
        msg: "Título y descripción son obligatorios"
      });
    }

    const historial = await HistorialPatrullaje.create({
      patrullaje_id,
      zona_id,
      sereno_id: usuario_id,
      tipo,
      titulo,
      descripcion,
      prioridad,
      latitud,
      longitud,
      visible_para_siguiente_turno
    });

    return res.status(201).json({
      ok: true,
      msg: "Historial registrado correctamente",
      historial
    });

  } catch (error) {

    console.error("Error registrarHistorial:", error);

    return res.status(500).json({
      message: "Error al registrar historial",
      error: error.message
    });
  }
};


// ======================================================
// OBTENER HISTORIAL POR PATRULLAJE
// ======================================================
const getHistorialByPatrullaje = async (req, res) => {

  try {

    const { patrullajeId } = req.params;

    const historial = await HistorialPatrullaje.findAll({

      where: {
        patrullaje_id: patrullajeId,
        estado: "ACTIVO"
      },

      include: [
        {
          model: Usuario,
          as: "usuario",
          include: [
            {
              model: Persona,
              as: "persona",
              attributes: [
                "id",
                "nombres",
                "apellidos",
                "foto_perfil"
              ]
            }
          ]
        }
      ],

      order: [["fecha_hora", "DESC"]]
    });

    return res.status(200).json({
      ok: true,
      historial
    });

  } catch (error) {

    console.error("Error obtenerHistorialPorPatrullaje:", error);

    return res.status(500).json({
      message: "Error al obtener historial",
      error: error.message
    });
  }
};


// ======================================================
// OBTENER CONTEXTO OPERATIVO DE ZONA
// ======================================================
const getContextoZona = async (req, res) => {

  try {

    const { zonaId } = req.params;

    // ==========================================
    // HISTORIAL OPERATIVO
    // ==========================================
    const historial = await HistorialPatrullaje.findAll({

      where: {
        zona_id: zonaId,
        estado: "ACTIVO",
        visible_para_siguiente_turno: true
      },

      include: [
        {
          model: Usuario,
          as: "usuario",
          include: [
            {
              model: Persona,
              as: "persona",
              attributes: [
                "id",
                "nombres",
                "apellidos",
                "foto_perfil"
              ]
            }
          ]
        }
      ],

      limit: 20,

      order: [["fecha_hora", "DESC"]]
    });

    // ==========================================
    // INCIDENCIAS RECIENTES
    // ==========================================
    const incidencias = await Incidencia.findAll({

      include: [
        {
          model: Usuario,
          as: "usuario",
          include: [
            {
              model: Persona,
              as: "persona",
              attributes: [
                "id",
                "nombres",
                "apellidos"
              ]
            }
          ]
        },
        {
          model: PatrullajeProgramado,
          as: "patrullaje",
          where: {
            zona_id: zonaId
          },
          attributes: ["id", "zona_id"]
        },
        {
          model: IncidenciaArchivo,
          as: "archivos"
        }
      ],

      limit: 20,

      order: [["fecha_hora", "DESC"]]
    });

    // ==========================================
    // ZONA
    // ==========================================
    const zona = await Zonas.findByPk(zonaId);

    return res.status(200).json({
      ok: true,
      zona,
      historial,
      incidencias
    });

  } catch (error) {
    console.error("Error obtenerContextoZona:", error);
    return res.status(500).json({
      message: "Error al obtener contexto operativo",
      error: error.message
    });
  }
};


// ======================================================
// RESUMEN OPERATIVO DE ZONA
// ======================================================
const getResumenZona = async (req, res) => {
  try {

    const { zonaId } = req.params;

    const totalHistorial = await HistorialPatrullaje.count({
      where: {
        zona_id: zonaId,
        estado: "ACTIVO"
      }
    });

    const totalAlertas = await HistorialPatrullaje.count({
      where: {
        zona_id: zonaId,
        tipo: "ALERTA",
        estado: "ACTIVO"
      }
    });

    const totalPuntosCriticos = await HistorialPatrullaje.count({
      where: {
        zona_id: zonaId,
        tipo: "PUNTO_CRITICO",
        estado: "ACTIVO"
      }
    });

    const totalIncidencias = await Incidencia.count({
      include: [
        {
          model: PatrullajeProgramado,
          as: "patrullaje",
          where: {
            zona_id: zonaId
          }
        }
      ]
    });

    return res.status(200).json({
      ok: true,

      resumen: {
        historial_operativo: totalHistorial,
        alertas_activas: totalAlertas,
        puntos_criticos: totalPuntosCriticos,
        incidencias: totalIncidencias
      }
    });

  } catch (error) {

    console.error("Error obtenerResumenZona:", error);

    return res.status(500).json({
      message: "Error al obtener resumen",
      error: error.message
    });
  }
};


// ======================================================
// ARCHIVAR HISTORIAL
// ======================================================
const archivarHistorial = async (req, res) => {

  try {

    const { historialId } = req.params;

    const historial = await HistorialPatrullaje.findByPk(historialId);

    if (!historial) {
      return res.status(404).json({
        ok: false,
        msg: "Historial no encontrado"
      });
    }

    historial.estado = "ARCHIVADO";

    await historial.save();

    return res.status(200).json({
      ok: true,
      msg: "Historial archivado correctamente"
    });

  } catch (error) {
    console.error("Error archivarHistorial:", error);
    return res.status(500).json({
      message: "Error al archivar historial",
      error: error.message
    });
  }
};

module.exports = {
  registerHistorial,
  getHistorialByPatrullaje,
  getContextoZona,
  getResumenZona,
  archivarHistorial
};