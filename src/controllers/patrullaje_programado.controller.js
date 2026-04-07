const db = require('../models');

const Usuario = db.Usuario;
const PatrullajeProgramado = db.PatrullajeProgramado;
const Zonas = db.Zonas;
const UnidadPatrullaje = db.UnidadPatrullaje;



// ======================================================
// CREAR PATRULLAJE
// ======================================================
const crearPatrullaje = async (req, res) => {
  try {
    const {
      unidad_id,
      zona_id,
      fecha,
      hora_inicio,
      hora_fin,
      descripcion
    } = req.body;

    const unidad = await UnidadPatrullaje.findByPk(unidad_id);

    if (!unidad) {
      return res.status(404).json({
        message: "Unidad no encontrada"
      });
    }

    const patrullaje = await PatrullajeProgramado.create({
      unidad_id,
      zona_id,
      fecha,
      hora_inicio,
      hora_fin,
      descripcion
    });

    res.status(201).json({
      message: "Patrullaje programado correctamente",
      patrullaje
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ======================================================
// LISTAR PATRULLAJES
// ======================================================
const listarPatrullajes = async (req, res) => {
  try {

    const patrullajes = await PatrullajeProgramado.findAll({

      include: [
        {
          model: UnidadPatrullaje,
          as: "unidad"
        },
        {
          model: Zonas,
          as: "zona"
        }
      ],
      order: [["fecha", "DESC"]]
    });
    res.json({
      total: patrullajes.length,
      patrullajes
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ======================================================
// OBTENER PATRULLAJE POR ID
// ======================================================
const obtenerPatrullajePorId = async (req, res) => {
  try {

    const { id } = req.params;

    const patrullaje = await PatrullajeProgramado.findByPk(id, {

      include: [
        {
          model: UnidadPatrullaje,
          as: "unidad",
          include: [
            {
              model: UnidadSereno,
              as: "serenos_unidad",
              include: [
                {
                  model: Usuario,
                  as: "sereno"
                }
              ]
            }
          ]
        },
        {
          model: Zonas,
          as: "zona"
        }
      ]

    });

    if (!patrullaje) {
      return res.status(404).json({
        message: "Patrullaje no encontrado"
      });
    }

    res.json(patrullaje);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ======================================================
// FINALIZAR PATRULLAJE
// ======================================================
const finalizarPatrullaje = async (req, res) => {
  try {
    const { id } = req.params;

    const patrullaje = await Patrullaje.findByPk(id);

    if (!patrullaje) {
      return res.status(404).json({ message: "Patrullaje no encontrado" });
    }

    patrullaje.estado = "FINALIZADO";
    patrullaje.fecha_fin = new Date();
    await patrullaje.save();

    res.json({ message: "Patrullaje finalizado correctamente" });
  } catch (error) {
    res.status(500).json({
      message: "Error al finalizar patrullaje",
      error: error.message,
    });
  }
};

// ======================================================
// ACTUALIZAR PATRULLAJE
// ======================================================
const updatePatrullaje = async (req, res) => {

  try {

    const { id } = req.params;

    const patrullaje = await PatrullajeProgramado.findByPk(id);

    if (!patrullaje) {
      return res.status(404).json({
        message: "Patrullaje no encontrado"
      });
    }

    await patrullaje.update(req.body);

    res.json({
      message: "Patrullaje actualizado",
      patrullaje
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }

};

// ======================================================
// ELIMINAR PATRULLAJE
// ======================================================

const deletePatrullaje = async (req, res) => {

  try {

    const { id } = req.params;

    const patrullaje = await PatrullajeProgramado.findByPk(id);

    if (!patrullaje) {
      return res.status(404).json({
        message: "Patrullaje no encontrado"
      });
    }

    await patrullaje.destroy();

    res.json({
      message: "Patrullaje eliminado"
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }

};


module.exports = {
  crearPatrullaje,
  listarPatrullajes,
  obtenerPatrullajePorId,
  finalizarPatrullaje,
  updatePatrullaje,
  deletePatrullaje
};
