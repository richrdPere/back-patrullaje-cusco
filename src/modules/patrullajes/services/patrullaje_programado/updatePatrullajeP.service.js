const db = require("../../../../database/models");

const {
  sequelize,
  PatrullajeProgramado,
  PatrullajePersonal,
  UnidadPatrullaje,
  Usuario,
  Policia,
  Zonas
} = db;

// Actualizar Patrullaje Programado
const updatePatrullajePService = async (id, data) => {

  const {
    unidad_id,
    zona_id,
    fecha,
    hora_inicio,
    hora_fin,
    descripcion,
    serenos = [],
    policias = []
  } = data;

  return await sequelize.transaction(async (t) => {

    // ==========================
    // VALIDAR PATRULLAJE
    // ==========================
    const patrullaje =
      await PatrullajeProgramado.findByPk(id, {
        transaction: t
      });

    if (!patrullaje) {
      throw new Error("Patrullaje no encontrado.");
    }

    // ==========================
    // VALIDAR UNIDAD
    // ==========================
    const unidad =
      await UnidadPatrullaje.findByPk(
        unidad_id,
        { transaction: t }
      );

    if (!unidad) {
      throw new Error("Unidad no encontrada.");
    }

    // ==========================
    // VALIDAR SERENOS
    // ==========================
    const serenosDB =
      await Usuario.findAll({

        where: {
          id: serenos
        },

        transaction: t

      });

    if (serenosDB.length !== serenos.length) {
      throw new Error("Uno o más serenos no existen.");
    }

    // ==========================
    // VALIDAR POLICIAS
    // ==========================
    const policiasDB = await Policia.findAll({
      where: {
        id: policias
      },
      transaction: t
    });

    if (policiasDB.length !== policias.length) {
      throw new Error("Uno o más policías no existen.");
    }

    // ==========================
    // ACTUALIZAR
    // ==========================
    await patrullaje.update({
      unidad_id,
      zona_id,
      fecha,
      hora_inicio,
      hora_fin,
      descripcion
    }, {
      transaction: t
    });

    // ==========================
    // ELIMINAR PERSONAL
    // ==========================
    await PatrullajePersonal.destroy({
      where: {
        patrullaje_id: patrullaje.id
      },
      transaction: t
    });

    // ==========================
    // NUEVO PERSONAL
    // ==========================
    const personal = [

      ...serenos.map(id => ({
        patrullaje_id: patrullaje.id,
        tipo_personal: "SERENO",
        personal_id: id
      })),

      ...policias.map(id => ({
        patrullaje_id: patrullaje.id,
        tipo_personal: "POLICIA",
        personal_id: id
      }))
    ];

    await PatrullajePersonal.bulkCreate(
      personal,
      {
        transaction: t
      }
    );

    // ==========================
    // CONSULTAR COMPLETO
    // ==========================

    const patrullajeActualizado =
      await PatrullajeProgramado.findByPk(
        patrullaje.id,
        {

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
          transaction: t
        }
      );
    return patrullajeActualizado;
  });
};

module.exports = updatePatrullajePService;