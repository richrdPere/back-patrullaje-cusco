const db = require("../../../../database/models");

// Modelos
const {
  sequelize,
  PatrullajeProgramado,
  PatrullajePersonal,
  UnidadPatrullaje,
  Usuario,
  Policia,
  Zonas
} = db;

// Crear Patrullaje Programado
const crearPatrullajeProgramadoService = async (data) => {

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
    // VALIDAR UNIDAD
    // ==========================
    const unidad = await UnidadPatrullaje.findByPk(
      unidad_id,
      { transaction: t }
    );

    if (!unidad) {
      throw new Error("Unidad no encontrada.");
    }

    // ==========================
    // VALIDAR SERENOS
    // ==========================
    const serenosDB = await Usuario.findAll({

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
    // CREAR PATRULLAJE
    // ==========================
    const patrullaje = await PatrullajeProgramado.create({

      unidad_id,
      zona_id,
      fecha,
      hora_inicio,
      hora_fin,
      descripcion,
      estado: "ASIGNADO"

    }, {
      transaction: t
    });

    // ==========================
    // PERSONAL
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
      { transaction: t }
    );

    const patrullajeCompleto =
      await PatrullajeProgramado.findByPk(
        patrullaje.id,
        {
          include: [
            {
              model: Zonas,
              as: "zona",

              attributes: [
                "nombre",
                "riesgo",
                "coordenadas",
                "descripcion"
              ]
            },
            {
              model: UnidadPatrullaje,
              as: "unidad",

              attributes: [
                "codigo",
                "tipo",
                "placa"
              ]
            }
          ],
          transaction: t
        }
      );

    return {
      serenos,
      patrullaje: {
        id: patrullajeCompleto.id,
        estado: patrullajeCompleto.estado,
        fecha: patrullajeCompleto.fecha,
        hora_inicio: patrullajeCompleto.hora_inicio,
        hora_fin: patrullajeCompleto.hora_fin,
        descripcion: patrullajeCompleto.descripcion,
        zona: {
          nombre: patrullajeCompleto.zona?.nombre,
          descripcion: patrullajeCompleto.zona?.descripcion,
          riesgo: patrullajeCompleto.zona?.riesgo,
          coordenadas: patrullajeCompleto.zona?.coordenadas ?? []
        },
        unidad: {
          codigo: patrullajeCompleto.unidad?.codigo,
          tipo: patrullajeCompleto.unidad?.tipo,
          placa: patrullajeCompleto.unidad?.placa
        }
      }
    };
  });
};

module.exports = crearPatrullajeProgramadoService;