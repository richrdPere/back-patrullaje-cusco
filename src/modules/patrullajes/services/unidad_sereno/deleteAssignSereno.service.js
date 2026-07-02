const db = require("../../../../database/models");

const {
  UnidadSereno
} = db;

const deleteAsignacionService = async (unidad_id, usuario_id) => {

  const eliminado =
    await UnidadSereno.destroy({

      where: {
        unidad_id,
        usuario_id
      }
    });

  if (!eliminado) {

    throw new Error(
      "No se encontró la asignación."
    );
  }
  return true;
}

module.exports = deleteAsignacionService;