const db = require('../models');
const { Op } = require("sequelize");
const { getIO } = require("../socket"); // ajusta ruta

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
      await t.rollback();
      return res.status(404).json({
        message: "Unidad no encontrada"
      });
    }

    // Validar existencia de serenos
    const serenosDB = await Usuario.findAll({
      where: { id: serenos }
    });

    if (serenosDB.length !== serenos.length) {
      await t.rollback();
      return res.status(400).json({
        message: "Uno o más serenos no existen"
      });
    }

    // Validar existencia de policías
    const policiasDB = await Policia.findAll({
      where: { id: policias }
    });

    if (policiasDB.length !== policias.length) {
      await t.rollback();
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
    }, { transaction: t });

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

    // =========================
    // - EMITIR SOCKET
    // =========================

    try {
      const io = getIO();

      // VOLVER A CONSULTAR CON RELACIONES
      const patrullajeCompleto = await PatrullajeProgramado.findByPk(patrullaje.id, {
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
        ]
      });

      // MAPEAR IGUAL QUE EN MOBILE
      const payload = {
        id: patrullajeCompleto.id,
        fecha: patrullajeCompleto.fecha,
        hora_inicio: patrullajeCompleto.hora_inicio,
        hora_fin: patrullajeCompleto.hora_fin,
        estado: patrullajeCompleto.estado,
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
      };

      // EMITIR A TODOS LOS SERENOS
      serenos.forEach((serenoId) => {
        io.to(`user_${serenoId}`).emit("nuevo_patrullaje", payload);
      });

    } catch (socketError) {
      console.error("⚠️ Error en socket:", socketError);
      // NO rollback aquí
    }

    // =========================
    // RESPUESTA
    // =========================
    res.status(201).json({
      message: "Patrullaje programado correctamente",
      patrullaje
    });

  } catch (error) {
    // SOLO rollback si NO se hizo commit
    if (!t.finished) {
      await t.rollback();
    }

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

    page = parseInt(page);
    limit = parseInt(limit);

    const offset = (page - 1) * limit;

    let where = {};

    if (fecha) {
      where.fecha = fecha;
    }

    if (descripcion) {
      where.descripcion = {
        [Op.like]: `%${descripcion}%`
      };
    }

    const { count, rows } = await PatrullajeProgramado.findAndCountAll({
      where,
      limit,
      offset,
      order: [["fecha", "DESC"], ["hora_inicio", "ASC"]],
      include: [
        {
          model: UnidadPatrullaje,
          as: "unidad",
          attributes: ["id", "codigo", "tipo", "placa", "estado"]
        },
        {
          model: Zonas,
          as: "zona",
          attributes: ["id", "nombre", "descripcion", "riesgo"]
        },
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
              attributes: ["id", "grado", "comisaria"],
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
    // FORMATEAR
    // =========================
    const data = rows.map(p => {
      const patrullaje = p.toJSON();

      const serenos = [];
      const policias = [];

      (patrullaje.personal || []).forEach(item => {

        // =========================
        // SERENOS
        // =========================
        if (item.tipo_personal === "SERENO" && item.usuario) {
          serenos.push({
            id: item.usuario.id,
            nombre: item.usuario.nombre,
            apellidos: item.usuario.apellidos,
            roles: item.usuario.roles?.map(r => r.nombre) || []
          });
        }

        // =========================
        // POLICIAS
        // =========================
        if (item.tipo_personal === "POLICIA" && item.policia) {
          policias.push({
            id: item.policia.id,
            grado: item.policia.grado,
            comisaria: item.policia.comisaria,
            usuario: item.policia.usuario
          });
        }

      });

      return {
        id: patrullaje.id,
        fecha: patrullaje.fecha,
        hora_inicio: patrullaje.hora_inicio,
        hora_fin: patrullaje.hora_fin,
        descripcion: patrullaje.descripcion,
        unidad: patrullaje.UnidadPatrullaje || null,
        zona: patrullaje.Zona || patrullaje.Zonas || null,
        estado: patrullaje.estado,
        createdAt: patrullaje.createdAt,
        updatedAt: patrullaje.updatedAt,
        serenos,
        policias,
      };
    });

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
const getPatrullajeById = async (req, res) => {
  try {

    const { id } = req.params;

    const patrullaje = await PatrullajeProgramado.findByPk(id, {

      include: [
        // UNIDAD
        {
          model: UnidadPatrullaje,
          attributes: ["id", "codigo", "tipo", "placa", "estado"]
        },

        // ZONA
        {
          model: Zonas,
          attributes: ["id", "nombre", "descripcion", "riesgo"]
        },

        // PERSONAL
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
                  as: "roles",
                  attributes: ["nombre"],
                  through: { attributes: [] }
                }
              ]
            },
            {
              model: Policia,
              as: "policia",
              attributes: ["id", "grado", "comisaria"],
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
      ]

    });

    if (!patrullaje) {
      return res.status(404).json({
        message: "Patrullaje no encontrado"
      });
    }

    const data = patrullaje.toJSON();

    const serenos = [];
    const policias = [];

    (data.personal || []).forEach(item => {

      // =========================
      // SERENOS
      // =========================
      if (item.tipo_personal === "SERENO" && item.usuario) {
        serenos.push({
          id: item.usuario.id,
          nombre: item.usuario.nombre,
          apellidos: item.usuario.apellidos,
          roles: item.usuario.roles?.map(r => r.nombre) || []
        });
      }

      // =========================
      // POLICIAS
      // =========================
      if (item.tipo_personal === "POLICIA" && item.policia) {
        policias.push({
          id: item.policia.id,
          grado: item.policia.grado,
          comisaria: item.policia.comisaria,
          usuario: item.policia.usuario
        });
      }

    });

    res.json({
      id: data.id,
      fecha: data.fecha,
      hora_inicio: data.hora_inicio,
      hora_fin: data.hora_fin,
      descripcion: data.descripcion,
      estado: data.estado,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      unidad: data.UnidadPatrullaje || null,
      zona: data.Zona || null,

      serenos,
      policias
    });

  } catch (error) {
    res.status(500).json({
      message: "Error al obtener patrullaje",
      error: error.message
    });
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

        },
        {
          model: Zonas,

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

  const t = await db.sequelize.transaction();

  try {
    const { id } = req.params;

    const {
      unidad_id,
      zona_id,
      fecha,
      hora_inicio,
      hora_fin,
      descripcion,
      serenos = [],
      policias = []
    } = req.body;

    // =========================
    // VALIDAR EXISTENCIA
    // =========================
    const patrullaje = await PatrullajeProgramado.findByPk(id, { transaction: t });

    if (!patrullaje) {
      await t.rollback();
      return res.status(404).json({
        message: "Patrullaje no encontrado"
      });
    }

    // Validar unidad
    const unidad = await UnidadPatrullaje.findByPk(unidad_id);

    if (!unidad) {
      await t.rollback();
      return res.status(404).json({
        message: "Unidad no encontrada"
      });
    }

    // =========================
    // VALIDAR SERENOS
    // =========================
    const serenosDB = await Usuario.findAll({
      where: { id: serenos },
      transaction: t
    });

    if (serenosDB.length !== serenos.length) {
      await t.rollback();
      return res.status(400).json({
        message: "Uno o más serenos no existen"
      });
    }

    // =========================
    // VALIDAR POLICIAS
    // =========================
    const policiasDB = await Policia.findAll({
      where: { id: policias },
      transaction: t
    });

    if (policiasDB.length !== policias.length) {
      await t.rollback();
      return res.status(400).json({
        message: "Uno o más policías no existen"
      });
    }

    // =========================
    // ACTUALIZAR PATRULLAJE
    // =========================
    await patrullaje.update({
      unidad_id,
      zona_id,
      fecha,
      hora_inicio,
      hora_fin,
      descripcion
    }, { transaction: t });

    // =========================
    // ELIMINAR PERSONAL ANTERIOR
    // =========================
    await PatrullajePersonal.destroy({
      where: { patrullaje_id: id },
      transaction: t
    });

    // =========================
    // INSERTAR NUEVO PERSONAL
    // =========================
    const personalData = [
      ...serenos.map(id => ({
        patrullaje_id: id ? patrullaje.id : null,
        tipo_personal: "SERENO",
        personal_id: id
      })),
      ...policias.map(id => ({
        patrullaje_id: id ? patrullaje.id : null,
        tipo_personal: "POLICIA",
        personal_id: id
      }))
    ];

    await PatrullajePersonal.bulkCreate(personalData, { transaction: t });

    // =========================
    // COMMIT
    // =========================
    await t.commit();

    res.json({
      message: "Patrullaje actualizado correctamente",
      patrullaje
    });

  } catch (error) {
    await t.rollback();

    res.status(500).json({
      message: "Error al actualizar patrullaje",
      error: error.message
    });
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
  getPatrullajeById,
  finalizarPatrullaje,
  updatePatrullaje,
  deletePatrullaje
};
