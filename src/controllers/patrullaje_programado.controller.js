const db = require('../models');
const { Op } = require("sequelize");

const PatrullajeProgramado = db.PatrullajeProgramado;
const PatrullajePersonal = db.PatrullajePersonal;
const UnidadPatrullaje = db.UnidadPatrullaje;
const Usuario = db.Usuario;
const Roles = db.Roles;
const Policia = db.Policia;
const Zonas = db.Zonas;

// ======================================================
// 1. CREAR PATRULLAJE
// ======================================================
const newPatrullajeProgramado = async (req, res) => {

  const t = await db.sequelize.transaction();

  try {
    const {
      unidad_id,
      zona_id,
      fecha,
      hora_inicio,
      hora_fin,
      descripcion,
      serenos,
      policias
    } = req.body;

    const unidad = await UnidadPatrullaje.findByPk(unidad_id);

    if (!unidad) {
      return res.status(404).json({
        message: "Unidad no encontrada"
      });
    }

    // Validar existencia de serenos
    const serenosDB = await Usuario.findAll({
      where: { id: serenos }
    });

    if (serenosDB.length !== serenos.length) {
      return res.status(400).json({
        message: "Uno o más serenos no existen"
      });
    }

    // Validar existencia de policías
    const policiasDB = await Policia.findAll({
      where: { id: policias }
    });

    if (policiasDB.length !== policias.length) {
      return res.status(400).json({
        message: "Uno o más policías no existen"
      });
    }

    // =========================
    // - CREAR PATRULLAJE
    // =========================
    const patrullaje = await PatrullajeProgramado.create({
      unidad_id,
      zona_id,
      fecha,
      hora_inicio,
      hora_fin,
      descripcion
    });

    // =========================
    // - INSERTAR PERSONAL
    // =========================
    const personalData = [
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

    await PatrullajePersonal.bulkCreate(personalData, { transaction: t });

    // =========================
    // - COMMIT
    // =========================
    await t.commit();

    res.status(201).json({
      message: "Patrullaje programado correctamente",
      patrullaje
    });

  } catch (error) {
    await t.rollback();

    res.status(500).json({
      message: "Error al crear patrullaje",
      error: error.message
    });
  }
};

// ======================================================
// 2.- LISTAR PATRULLAJES PROGRAMADO + PAGINATED Y FILTERS
// ======================================================
const getPatrullajesProgramadosPaginated = async (req, res) => {
  try {
    let {
      page = 1,
      limit = 5,
      fecha,
      descripcion
    } = req.query;

    // =========================
    // - NORMALIZAR PAGINACIÓN
    // =========================
    page = parseInt(page);
    limit = parseInt(limit);

    const offset = (page - 1) * limit;

    // =========================
    // - FILTROS DINÁMICOS
    // =========================
    let where = {};

    if (fecha) {
      where.fecha = fecha;
    }

    if (descripcion) {
      where.descripcion = {
        [Op.like]: `%${descripcion}%`
      };
    }

    // =========================
    // - CONSULTA
    // =========================
    const { count, rows } = await PatrullajeProgramado.findAndCountAll({
      where,
      limit,
      offset,
      order: [["fecha", "DESC"], ["hora_inicio", "ASC"]],
      include: [
        {
          model: PatrullajePersonal,
          as: "personal",
          include: [
            {
              model: Usuario,
              as: "usuario",
              attributes: ["id", "nombre", "apellidos"],
              include: [
                {
                  model: Roles,
                  attributes: ["nombre"],
                  as: 'roles',
                  through: { attributes: [] }
                }
              ]
            },
            {
              model: Policia,
              as: "policia",
              include: [
                {
                  model: Usuario,
                  as: "usuario",
                  attributes: ["id", "nombre", "apellidos"]
                }
              ]
            }
          ]
        }
      ],
      distinct: true
    });

    // =========================
    // - FORMATEAR RESPUESTA
    // =========================
    const data = rows.map(p => {
      const patrullaje = p.toJSON();

      const serenos = [];
      const policias = [];

      patrullaje.personal.forEach(item => {

        if (item.tipo_personal === "SERENO" && item.usuario) {
          serenos.push({
            id: item.usuario.id,
            nombre: item.usuario.nombre,
            apellidos: item.usuario.apellidos,
            roles: item.usuario.roles?.map(r => r.nombre) || []
          });
        }

        if (item.tipo_personal === "POLICIA" && item.policia) {
          policias.push({
            id: item.policia.id,
            grado: item.policia.grado,
            comisaria: item.policia.comisaria,
            usuario: item.policia.Usuario
          });
        }

      });

      return {
        ...patrullaje,
        serenos,
        policias,
        personal: undefined // opcional: ocultar crudo
      };
    });


    // =========================
    // - RESPUESTA PAGINADA
    // =========================
    res.json({
      total: count,
      page,
      limit,
      totalPages: Math.ceil(count / limit),
      data
    });

  } catch (error) {
    res.status(500).json({
      message: "Error al listar patrullajes",
      error: error.message
    });
  }
};


// ======================================================
// 3. OBTENER PATRULLAJE PROGRAMADO POR ID
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
// 4. LISTAR TODOS PATRULLAJE PROGRAMADO
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
  newPatrullajeProgramado,
  getPatrullajesProgramadosPaginated,
  listarPatrullajes,
  obtenerPatrullajePorId,
  finalizarPatrullaje,
  updatePatrullaje,
  deletePatrullaje
};
