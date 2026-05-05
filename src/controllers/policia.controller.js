const bcrypt = require("bcryptjs");
const { Op, fn, col, where: whereFn } = require("sequelize");

const db = require('../models');

const Usuario = db.Usuario;
const Roles = db.Roles;
const UsuarioRol = db.UsuarioRol;
const Policia = db.Policia;
const Persona = db.Persona;

// ======================================================
// 1. CREAR POLICIA
// ======================================================
const newPolicia = async (req, res) => {
  const t = await db.sequelize.transaction();

  try {
    const {
      nombres,
      apellidos,
      documento_identidad,
      telefono,
      direccion,
      departamento,
      provincia,
      distrito,
      grado,
      comisaria,
      codigo_institucional
    } = req.body;

    // ==========================
    // VALIDAR SI YA EXISTE PERSONA
    // ==========================
    const existePersona = await Persona.findOne({
      where: { documento_identidad }
    });

    if (existePersona) {
      await t.rollback();
      return res.status(400).json({
        message: "El DNI ya está registrado"
      });
    }

    // ==========================
    // CREAR PERSONA
    // ==========================
    const persona = await Persona.create({
      nombres,
      apellidos,
      documento_identidad,
      telefono,
      direccion,
      departamento,
      provincia,
      distrito
    }, { transaction: t });

    // ==========================
    // CREAR POLICIA
    // ==========================
    const policia = await Policia.create({
      persona_id: persona.id,
      grado,
      comisaria,
      codigo_institucional
    }, { transaction: t });

    await t.commit();


    res.status(201).json({
      message: "Policía creado correctamente",
      data: {
        id: policia.id,
        persona
      }
    });

  } catch (error) {
    await t.rollback();

    res.status(500).json({
      message: "Error al crear policía",
      error: error.message
    });
  }
};
// ======================================================
// 2. LISTAR POLICIAS + PAGINATED Y FILTERS
// ======================================================
const getPoliciasPaginated = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 5,
      nombres = "",
      dni = ""
    } = req.query;

    const offset = (page - 1) * limit;

    const wherePersona = {};
    const filtros = [];

    // BUSCAR POR NOMBRE COMPLETO
    if (nombres) {
      filtros.push(
        where(
          fn(
            "concat",
            col("persona.nombres"),
            " ",
            col("persona.apellidos")
          ),
          {
            [Op.like]: `%${nombres.trim()}%`
          }
        )
      );
    }

    // BUSCAR POR DNI
    if (dni) {
      filtros.push({
        documento_identidad: {
          [Op.like]: `%${dni.trim()}%`
        }
      });
    }

    if (filtros.length > 0) {
      wherePersona[Op.and] = filtros;
    }

    // CONSULTA
    const { count, rows } = await Policia.findAndCountAll({
      include: [
        {
          model: Persona,
          as: "persona",
          where: wherePersona
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["id", "DESC"]],
      distinct: true
    });

    // RESPUESTA
    res.json({
      total: count,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(count / limit),
      data: rows
    });

  } catch (error) {
    res.status(500).json({
      message: "Error al listar policías",
      error: error.message
    });
  }
};

// ======================================================
// 3. OBTENER POLICIA POR ID
// ======================================================
const getPoliciaById = async (req, res) => {
  try {
    const { id } = req.params;

    const policia = await Policia.findByPk(id, {
      include: [
        {
          model: Persona,
          as: "persona"
        }
      ]
    });

    if (!policia) {
      return res.status(404).json({
        message: "Policía no encontrado"
      });
    }

    res.json({
      id: policia.id,
      grado: policia.grado,
      comisaria: policia.comisaria,
      codigo_institucional: policia.codigo_institucional,
      persona: policia.persona
    });

  } catch (error) {
    res.status(500).json({
      message: "Error al obtener policía",
      error: error.message
    });
  }
};

// ======================================================
// 4. ACTUALIZAR POLICIA POR ID
// ======================================================
const updatePolicia = async (req, res) => {
  const t = await db.sequelize.transaction();

  try {
    const { id } = req.params;


    // BUSCAR POLICIA
    const policia = await Policia.findByPk(id);

    if (!policia) {
      await t.rollback();
      return res.status(404).json({
        message: "Policía no encontrado"
      });
    }

    // BUSCAR PERSONA RELACIONADA
    const persona = await Persona.findByPk(policia.persona_id);

    if (!persona) {
      await t.rollback();
      return res.status(404).json({
        message: "Persona asociada no encontrada"
      });
    }

    // ACTUALIZAR USUARIO
    await persona.update({
      nombres: req.body.nombre,
      apellidos: req.body.apellidos,
      telefono: req.body.telefono,
      direccion: req.body.direccion,
      departamento: req.body.departamento,
      provincia: req.body.provincia,
      distrito: req.body.distrito
    }, { transaction: t });

    // ACTUALIZAR POLICIA
    await policia.update({
      grado: req.body.grado,
      comisaria: req.body.comisaria,
      codigo_institucional: req.body.codigo_institucional
    }, { transaction: t });

    await t.commit();

    res.json({
      message: "Policía actualizado correctamente"
    });

  } catch (error) {
    await t.rollback();

    res.status(500).json({
      message: "Error al actualizar policía",
      error: error.message
    });
  }
};

// ======================================================
// 5. ELIMINAR POLICIA
// ======================================================
const deletePolicia = async (req, res) => {
  const t = await db.sequelize.transaction();

  try {
    const { id } = req.params;

    // BUSCAR POLICIA
    const policia = await Policia.findByPk(id);

    if (!policia) {
      await t.rollback();
      return res.status(404).json({
        message: "Policía no encontrado"
      });
    }

    // BUSCAR PERSONA
    const persona = await Persona.findByPk(policia.persona_id);

    // ELIMINAR POLICIA
    await policia.destroy({ transaction: t });


    // ELIMINAR PERSONA
    if (persona) {
      await persona.destroy({ transaction: t });
    }

    await t.commit();

    res.json({
      message: "Policía eliminado correctamente"
    });

  } catch (error) {
    await t.rollback();

    res.status(500).json({
      message: "Error al eliminar policía",
      error: error.message
    });
  }
};

// ======================================================
// 6. LISTAR TODOS LOS POLICIAS
// ======================================================
const getAllPolicias = async (req, res) => {
  try {

    const policias = await Policia.findAll({
      attributes: ['id', 'grado', 'comisaria'],
      include: [
        {
          model: Persona,
          as: "persona",
          attributes: ['nombres', 'apellidos', 'documento_identidad']
        }
      ],
      order: [
        [{ model: Persona, as: 'persona' }, 'nombres', 'ASC']
      ]
    });

    // FORMATEAR PARA SELECT
    const data = policias.map(p => {
      const persona = p.persona;

      return {
        id: p.id,
        label: `${persona.nombres} ${persona.apellidos}`,
        dni: persona.documento_identidad,
        grado: p.grado,
        comisaria: p.comisaria,
        // opcional: devolver objeto completo si lo necesitas
        persona
      };
    });

    res.json({
      total: data.length,
      data
    });

  } catch (error) {
    res.status(500).json({
      message: "Error al listar policías",
      error: error.message
    });
  }
};


module.exports = {
  newPolicia,
  getPoliciasPaginated,
  getPoliciaById,
  updatePolicia,
  deletePolicia,
  getAllPolicias
}
