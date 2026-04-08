const bcrypt = require("bcryptjs");
const { Op, fn, col, where: whereFn } = require("sequelize");

const db = require('../models');

const Usuario = db.Usuario;
const Roles = db.Roles;
const UsuarioRol = db.UsuarioRol;
const Policia = db.Policia;

// ======================================================
// 1. CREAR POLICIA
// ======================================================
const newPolicia = async (req, res) => {
  const t = await db.sequelize.transaction();

  try {
    const {
      nombre,
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
    // VALIDAR EXISTENCIA
    // ==========================
    const existe = await Usuario.findOne({
      where: {
        documento_identidad
      }
    });

    if (existe) {
      await t.rollback();
      return res.status(400).json({
        message: "El DNI ya está registrado"
      });
    }

    // ==========================
    // CREAR USUARIO BASE
    // ==========================
    const passwordHash = await bcrypt.hash(documento_identidad, 10);

    const usuario = await Usuario.create({
      nombre,
      apellidos,
      username: documento_identidad,
      password: passwordHash,
      documento_identidad,
      telefono,
      direccion,
      departamento,
      provincia,
      distrito
    }, { transaction: t });

    // ==========================
    // ASIGNAR ROL POLICIA
    // ==========================
    const rolPolicia = await Roles.findOne({
      where: { nombre: 'POLICIA' }
    });

    if (!rolPolicia) {
      await t.rollback();
      return res.status(500).json({
        message: "El rol POLICIA no existe en la base de datos"
      });
    }

    // Asociar roles al usuario
    const relaciones = rolPolicia.map((rol) => ({
      usuario_id: usuario.id,
      rol_id: rol.id,
    }));
    await UsuarioRol.bulkCreate(relaciones);

    // await usuario.addRole(rolPolicia, { transaction: t });

    // ==========================
    // CREAR POLICIA
    // ==========================
    const policia = await Policia.create({
      usuario_id: usuario.id,
      grado,
      comisaria,
      codigo_institucional
    }, { transaction: t });

    await t.commit();

    res.status(201).json({
      message: "Policía creado correctamente",
      data: {
        id: policia.id,
        usuario
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

    const whereUsuario = {};
    const filtros = [];

    // ==========================
    // BUSCAR POR NOMBRE COMPLETO
    // ==========================
    if (nombres) {
      filtros.push(
        whereFn(
          fn(
            "concat",
            col("usuario.nombre"),
            " ",
            col("usuario.apellidos")
          ),
          {
            [Op.like]: `%${nombres.trim()}%`
          }
        )
      );
    }

    // ==========================
    // BUSCAR POR DNI
    // ==========================
    if (dni) {
      filtros.push({
        "$usuario.documento_identidad$": {
          [Op.like]: `%${dni.trim()}%`
        }
      });
    }

    if (filtros.length > 0) {
      whereUsuario[Op.and] = filtros;
    }

    // ==========================
    // CONSULTA
    // ==========================
    const { count, rows } = await Policia.findAndCountAll({
      include: [
        {
          model: Usuario,
          as: "usuario",
          attributes: { exclude: ["password"] },
          where: whereUsuario
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [[{ model: Usuario, as: "usuario" }, "createdAt", "DESC"]],
      distinct: true // evita duplicados
    });

    // ==========================
    // RESPUESTA
    // ==========================
    res.json({
      total: count,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(count / limit),
      data: rows.map(usuario => {

        const user = usuario.toJSON();

        return {
          ...user,
          roles: user.roles?.map(r => r.nombre) || []
        };

      }),
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
          model: Usuario,
          as: "usuario",
          attributes: { exclude: ["password"] }
        }
      ]
    });

    if (!policia) {
      return res.status(404).json({
        message: "Policía no encontrado"
      });
    }

    res.json(policia);

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

    const policia = await Policia.findByPk(id);

    if (!policia) {
      await t.rollback();
      return res.status(404).json({
        message: "Policía no encontrado"
      });
    }

    const usuario = await Usuario.findByPk(policia.usuario_id);

    // ==========================
    // ACTUALIZAR USUARIO
    // ==========================
    await usuario.update({
      nombre: req.body.nombre,
      apellidos: req.body.apellidos,
      telefono: req.body.telefono,
      direccion: req.body.direccion,
      departamento: req.body.departamento,
      provincia: req.body.provincia,
      distrito: req.body.distrito
    }, { transaction: t });

    // ==========================
    // ACTUALIZAR POLICIA
    // ==========================
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

    const policia = await Policia.findByPk(id);

    if (!policia) {
      await t.rollback();
      return res.status(404).json({
        message: "Policía no encontrado"
      });
    }

    // eliminar usuario relacionado
    await Usuario.destroy({
      where: { id: policia.usuario_id },
      transaction: t
    });

    // eliminar policia
    await policia.destroy({ transaction: t });

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
      include: [
        {
          model: Usuario,
          as: "usuario",
          attributes: { exclude: ["password"] }
        }
      ]
    });

    res.json({
      total: policias.length,
      policias
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
