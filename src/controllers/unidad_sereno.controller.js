const { Usuario, UnidadPatrullaje, UnidadSereno } = require("../models");


// ======================================================
// 1. ASIGNAR SERENOS
// ======================================================
const asignarSerenos = async (req, res) => {

  try {

    const { unidad_id, usuarios } = req.body;

    const unidad = await UnidadPatrullaje.findByPk(unidad_id);

    if (!unidad) {
      return res.status(404).json({
        message: "Unidad no encontrada"
      });
    }

    // eliminar asignaciones anteriores
    await UnidadSereno.destroy({
      where: { unidad_id }
    });

    // crear nuevas asignaciones
    const asignaciones = usuarios.map(usuario_id => ({
      unidad_id,
      usuario_id
    }));

    await UnidadSereno.bulkCreate(asignaciones);

    res.json({
      message: "Serenos asignados correctamente"
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Error al asignar serenos"
    });

  }

};

// ======================================================
// 2. OBTENER SERENOS DE UNA UNIDAD
// ======================================================
const obtenerSerenosUnidad = async (req, res) => {

  try {

    const { unidad_id } = req.params;

    const unidad = await UnidadPatrullaje.findByPk(unidad_id, {
      include: {
        model: Usuario,
        attributes: ["id", "nombre", "apellidos", "rol"],
        through: { attributes: [] }
      }
    });
    res.json(unidad);

  } catch (error) {
    res.status(500).json({
      message: "Error al obtener serenos"
    });
  }
};

// ======================================================
// 3. ELIMINAR ASIGNACION DE UN SERENO A UNA UNIDAD
// ======================================================
const eliminarAsignacion = async (req, res) => {

  try {

    const { unidad_id, usuario_id } = req.params;

    const eliminado = await UnidadSereno.destroy({
      where: {
        unidad_id: unidad_id,
        usuario_id: usuario_id
      }
    });

    if (!eliminado) {
      return res.status(404).json({
        message: "No se encontró la asignación"
      });
    }

    return res.json({
      message: "Asignación eliminada correctamente"
    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      message: "Error al eliminar la asignación"
    });

  }

};

module.exports = {
  asignarSerenos,
  obtenerSerenosUnidad,
  eliminarAsignacion
};
