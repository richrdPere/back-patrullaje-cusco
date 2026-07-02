const db = require("../../../../database/models");

// Modelos
const {
  sequelize,
  Usuario,
  UnidadPatrullaje,
  UnidadSereno
} = db;

// Asignar serenos a unidad
const assignSerenosService = async (data) => {

  const {
    unidad_id,
    usuarios = []
  } = data;

  return await sequelize.transaction(async (t) => {

    const unidad =
      await UnidadPatrullaje.findByPk(
        unidad_id,
        { transaction: t }
      );

    if (!unidad) {
      throw new Error("Unidad no encontrada.");
    }

    const usuariosDB =
      await Usuario.findAll({

        where: {
          id: usuarios
        },
        transaction: t
      });

    if (usuariosDB.length !== usuarios.length) {
      throw new Error(
        "Uno o más usuarios no existen."
      );
    }

    await UnidadSereno.destroy({
      where: {
        unidad_id
      },
      transaction: t
    });

    const asignaciones =
      usuarios.map(usuario_id => ({
        unidad_id,
        usuario_id
      }));

    await UnidadSereno.bulkCreate(
      asignaciones,
      {
        transaction: t
      }
    );
    return true;
  });
};

module.exports = assignSerenosService;