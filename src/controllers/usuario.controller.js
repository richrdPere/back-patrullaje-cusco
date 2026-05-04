const bcrypt = require("bcryptjs");
const { Op, fn, col, where: whereFn } = require("sequelize");

const db = require('../models');

const Usuario = db.Usuario;
const Persona = db.Persona;
const Roles = db.Roles;
const UsuarioRol = db.UsuarioRol;



// ======================================================
// 1. LISTAR USUARIOS (con filtros básicos)
// ======================================================
const getUsuariosPaginated = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 5,
      nombres = "",
      dni = "",
      rol
    } = req.query;

    const offset = (page - 1) * limit;

    // FILTROS PERSONA
    const wherePersona = {};
    const filtrosPersona = [];

    // - BUSCAR POR NOMBRES (en Persona)
    if (nombres) {
      filtrosPersona.push(
        whereFn(
          fn("concat", col("Persona.nombres"), " ", col("Persona.apellidos")),
          {
            [Op.like]: `%${nombres.trim()}%`
          }
        )
      );
    }

    // - BUSCAR POR DNI (en Persona)
    if (dni) {
      filtrosPersona.push({
        documento_identidad: {
          [Op.like]: `%${dni.trim()}%`
        }
      });
    }

    // - Agregar filtros al where
    if (filtrosPersona.length > 0) {
      wherePersona[Op.and] = filtrosPersona;
    }

    // INCLUDE PERSONA
    const includePersona = {
      model: Persona,
      attributes: [
        "id",
        "nombres",
        "apellidos",
        "documento_identidad",
        "telefono",
        "direccion",
        "departamento",
        "provincia",
        "distrito",
        "foto_perfil",
        "updatedAt"
      ],
      required: true,
      where: wherePersona
    };


    // INCLUDE ROLES
    const includeRoles = {
      model: Roles,
      attributes: ["nombre"],
      as: 'roles',
      through: { attributes: [] }, // Oculta tabla intermedia
      required: true
    };

    // Filtro por rol
    if (rol) {
      includeRoles.where = {
        nombre: rol
      };
      includeRoles.required = true; // INNER JOIN
    } else {
      // EXCLUIR POLICIA
      includeRoles.where = {
        nombre: {
          [Op.ne]: 'POLICIA'
        }
      };
      includeRoles.required = true;
    }


    // CONSULTA
    const { count, rows } = await Usuario.findAndCountAll({
      limit: parseInt(limit),
      offset: parseInt(offset),
      include: [includePersona, includeRoles],
      attributes: { exclude: ["password"] },
      order: [["createdAt", "DESC"]],
      distinct: true, // IMPORTANTE para evitar duplicados
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
          id: user.id,
          username: user.username,
          correo: user.correo,
          estado: user.estado,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,

          persona: user.Persona,

          roles: user.roles?.map(r => r.nombre) || []
        };

      }),
    });

  } catch (error) {
    res.status(500).json({
      message: "Error al listar usuarios",
      error: error.message,
    });
  }
};

// ======================================================
// 2. OBTENER USUARIO POR ID
// ======================================================
const getUsuarioById = async (req, res) => {
  try {
    const { id } = req.params;

    const usuario = await Usuario.findByPk(id, {
      attributes: { exclude: ["password"] },
      include: [
        {
          model: Persona,
          attributes: [
            "id",
            "nombres",
            "apellidos",
            "documento_identidad",
            "telefono",
            "direccion",
            "departamento",
            "provincia",
            "distrito",
            "foto_perfil",
            "updatedAt"
          ],
          required: true
        },
        {
          model: Roles,
          as: 'roles',
          attributes: ['nombre'],
          through: { attributes: [] }
        }
      ]
    });

    if (!usuario) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const user = usuario.toJSON();

    const usuarioFormateado = {
      id: user.id,
      username: user.username,
      correo: user.correo,
      estado: user.estado,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,

      persona: user.Persona,

      roles: user.roles?.map(r => r.nombre) || []
    };

    res.json(usuarioFormateado);

  } catch (error) {
    res.status(500).json({
      message: "Error al obtener usuario",
      error: error.message,
    });
  }
};

// ======================================================
// 3. CREAR USUARIO
// ======================================================
const newUsuario = async (req, res) => {
  const t = await db.sequelize.transaction();

  try {
    const {
      nombres,
      apellidos,
      correo,
      departamento,
      direccion,
      distrito,
      documento_identidad,
      provincia,
      roles,
      telefono,
    } = req.body;

    // 1. VALIDACIONES
    // - Generar username automáticamente
    const username = documento_identidad;

    // - Password inicial = DNI
    const password = documento_identidad;

    // - Validar persona existente
    const personaExistente = await Persona.findOne({
      where: { documento_identidad }
    });

    if (personaExistente) {
      return res.status(400).json({
        message: "El DNI ya está registrado"
      });
    }
    // - Validar USUARIO
    const usuarioExistente = await Usuario.findOne({
      where: {
        [Op.or]: [
          { username },
          { correo }
        ]
      }
    });

    if (usuarioExistente) {

      if (usuarioExistente.username === username) {
        return res.status(400).json({
          message: "El username ya está registrado"
        });
      }

      if (usuarioExistente.correo === correo) {
        return res.status(400).json({
          message: "El correo ya está registrado"
        });
      }

    }

    // 2. CREAR PERSONA
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

    // 3. CREAR USUARIO
    // - Encriptar contraseña
    const passwordHash = await bcrypt.hash(password, 12);

    // - Crear usuario
    const usuario = await Usuario.create({
      persona_id: persona.id,
      username,
      password: passwordHash,
      correo,
      estado: true
    }, { transaction: t });

    // 4. VALIDAR ROLES

    // Buscar roles en BD
    const rolesDB = await Roles.findAll({
      where: {
        nombre: roles
      }
    });

    if (!rolesDB || rolesDB.length === 0) {
      await t.rollback();
      return res.status(400).json({
        message: "Rol(es) no válido(s)"
      });
    }

    // 5. ASIGNAR ROLES
    const relaciones = rolesDB.map((rol) => ({
      usuario_id: usuario.id,
      rol_id: rol.id,
    }));
    await UsuarioRol.bulkCreate(relaciones, { transaction: t });

    // 6. COMMIT
    await t.commit();

    // 7. RESPUESTA
    res.status(201).json({
      message: "Usuario creado correctamente",
      usuario: {
        id: usuario.id,
        username: usuario.username,
        correo: usuario.correo,
        estado: usuario.estado,

        persona: {
          id: persona.id,
          nombres: persona.nombres,
          apellidos: persona.apellidos,
          documento_identidad: persona.documento_identidad
        },

        roles: rolesDB.map(r => r.nombre)
      }
    });

  } catch (error) {
    await t.rollback();
    res.status(500).json({
      message: "Error al crear usuario",
      error: error.message,
    });
  }
};

// ======================================================
// 4. ACTUALIZAR USUARIO
// ======================================================
const updateUsuario = async (req, res) => {
  const t = await db.sequelize.transaction();

  try {
    const { id } = req.params;

    const {
      roles,
      password,
      // datos de usuario
      correo,
      estado,
      // datos de persona
      nombres,
      apellidos,
      telefono,
      direccion,
      departamento,
      provincia,
      distrito,
      documento_identidad
    } = req.body;

    // 1. BUSCAR USUARIO + PERSONA
    const usuario = await Usuario.findByPk(id, {
      include: [{ model: Persona }],
      transaction: t
    });

    if (!usuario) {
      await t.rollback();
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const persona = usuario.Persona;

    // 2. VALIDACIONES
    // Validar DNI único (si se está cambiando)
    if (documento_identidad && documento_identidad !== persona.documento_identidad) {
      const existeDNI = await Persona.findOne({
        where: { documento_identidad },
        transaction: t
      });

      if (existeDNI) {
        await t.rollback();
        return res.status(400).json({
          message: "El DNI ya está registrado"
        });
      }
    }

    // 3. ACTUALIZAR PERSONA
    await persona.update({
      nombres,
      apellidos,
      telefono,
      direccion,
      departamento,
      provincia,
      distrito,
      documento_identidad
    }, { transaction: t });

    // 4. ACTUALIZAR USUARIO
    const dataUsuario = {
      correo,
      estado
    };

    if (password) {
      dataUsuario.password = await bcrypt.hash(password, 12);
    }

    await usuario.update(dataUsuario, { transaction: t });

    // 5. ACTUALIZAR ROLES

    // Actualizar roles
    if (roles && Array.isArray(roles)) {

      // 1. Buscar roles en DB
      const rolesDB = await Roles.findAll({
        where: {
          nombre: {
            [Op.in]: roles
          }
        },
        transaction: t
      });

      // 2. Validar que todos existan
      if (rolesDB.length !== roles.length) {
        await t.rollback();
        return res.status(400).json({
          message: "Uno o más roles no existen"
        });
      }

      // 3. Eliminar actuales
      await UsuarioRol.destroy({
        where: { usuario_id: id },
        transaction: t
      });

      // 4. Insertar nuevos
      const nuevosRoles = rolesDB.map(r => ({
        usuario_id: id,
        rol_id: r.id
      }));

      await UsuarioRol.bulkCreate(nuevosRoles, { transaction: t });
    }

    // 6. COMMIT
    await t.commit();

    res.json({ message: "Usuario actualizado correctamente" });

  } catch (error) {
    await t.rollback();

    res.status(500).json({
      message: "Error al actualizar usuario",
      error: error.message,
    });
  }
};

// ======================================================
// 5. CAMBIAR ESTADO DEL USUARIO (SOFT DELETE)
// ======================================================
const changeEstadoUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body; // true | false

    // ==========================
    // 1. VALIDAR INPUT
    // ==========================
    if (typeof estado !== "boolean") {
      return res.status(400).json({
        message: "El estado debe ser booleano (true o false)"
      });
    }

    // ==========================
    // 2. BUSCAR USUARIO + PERSONA
    // ==========================
    const usuario = await Usuario.findByPk(id, {
      include: [
        {
          model: Persona,
          attributes: ["id", "nombres", "apellidos", "documento_identidad"]
        }
      ]
    });

    if (!usuario) {
      return res.status(404).json({
        message: "Usuario no encontrado"
      });
    }

    // ==========================
    // 3. VALIDAR SI YA ESTÁ EN ESE ESTADO
    // ==========================
    if (usuario.estado === estado) {
      return res.status(400).json({
        message: estado
          ? "El usuario ya está activo"
          : "El usuario ya está desactivado"
      });
    }

    // ==========================
    // 4. ACTUALIZAR ESTADO
    // ==========================
    usuario.estado = estado;
    await usuario.save();

    // ==========================
    // 5. RESPUESTA
    // ==========================
    res.json({
      message: estado
        ? "Acceso activado correctamente"
        : "Acceso desactivado correctamente",

      usuario: {
        id: usuario.id,
        username: usuario.username,
        estado: usuario.estado,
        persona: usuario.Persona
      }
    });

  } catch (error) {
    res.status(500).json({
      message: "Error al actualizar estado del usuario",
      error: error.message,
    });
  }
};

// ======================================================
// 6. ELIMINAR USUARIO
// ======================================================
const deleteUsuario = async (req, res) => {
  const t = await db.sequelize.transaction();

  try {
    const { id } = req.params;

    // 1. BUSCAR USUARIO + PERSONA
    const usuario = await Usuario.findByPk(id, {
      include: [{ model: Persona }],
      transaction: t
    });

    if (!usuario) {
      await t.rollback();
      return res.status(404).json({
        message: "Usuario no encontrado"
      });
    }

    const personaId = usuario.persona_id;

    // 2. ELIMINAR ROLES
    await UsuarioRol.destroy({
      where: { usuario_id: id },
      transaction: t
    });

    // 3. ELIMINAR USUARIO
    await usuario.destroy({ transaction: t });

    // 4. ELIMINAR PERSONA
    await Persona.destroy({
      where: { id: personaId },
      transaction: t
    });

    // 5. COMMIT
    await t.commit();

    res.json({
      message: "Usuario y persona eliminados correctamente"
    });

  } catch (error) {
    await t.rollback();

    console.error("Error al eliminar usuario:", error);

    res.status(500).json({
      message: "Error al eliminar usuario",
      error: error.message
    });
  }
};

// ======================================================
// 7. LISTAR TODOS LOS SERENOS
// ======================================================
const getSerenosAndConductores = async (req, res) => {
  try {

    const usuarios = await Usuario.findAll({
      where: {
        estado: true // SOLO SERENOS ACTIVOS
      },
      include: [
        {
          model: Persona,
          attributes: [
            "id",
            "nombres",
            "apellidos",
            "documento_identidad",
            "telefono"
          ],
          required: true
        },
        {
          model: Roles,
          as: 'roles',
          attributes: ["nombre"],
          where: {
            nombre: {
              [Op.in]: ["SERENO", "CONDUCTOR"]
            }
          },
          through: { attributes: [] },
          required: true
        }
      ],
      distinct: true
    });

    // ==========================
    // TRANSFORMACIÓN
    // ==========================
    const resultado = usuarios.map(u => {
      const user = u.toJSON();

      return {
        id: user.id,
        username: user.username,
        estado: user.estado,

        persona: user.Persona,

        roles: user.roles.map(r => r.nombre)
      };
    });

    res.json({
      total: resultado.length,
      data: resultado
    });

  } catch (error) {
    res.status(500).json({
      message: "Error al listar serenos y conductores",
      error: error.message
    });
  }
};

module.exports = {
  getUsuariosPaginated,
  getUsuarioById,
  newUsuario,
  updateUsuario,
  changeEstadoUsuario,
  deleteUsuario,
  getSerenosAndConductores
};
