const bcrypt = require("bcryptjs");
const { Op, fn, col, where: whereFn } = require("sequelize");

const db = require('../models');

const Usuario = db.Usuario;
const Roles = db.Roles;
const UsuarioRol = db.UsuarioRol;



// ======================================================
// 1. LISTAR USUARIOS (con filtros básicos)
// ======================================================
const listarUsuarios = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 5,
      nombres = "",
      dni = "",
      rol
    } = req.query;

    const offset = (page - 1) * limit;

    const where = {};

    // ==========================
    // BUSCADOR - Nombres
    // ==========================
    const filtros = [];

    if (nombres) {
      filtros.push(
        whereFn(
          fn("concat", col("Usuario.nombre"), " ", col("Usuario.apellidos")),
          {
            [Op.like]: `%${nombres.trim()}%`
          }
        )
      );
    }

    // ==========================
    // BUSCADOR - DNI
    // ==========================
    if (dni) {
      filtros.push({
        documento_identidad: {
          [Op.like]: `%${dni.trim()}%`
        }
      });
    }

    // Agregar filtros al where
    if (filtros.length > 0) {
      where[Op.and] = filtros;
    }

    // ==========================
    // INCLUDE ROLES
    // ==========================
    const includeRoles = {
      model: Roles,
      attributes: ["nombre"],
      as: 'roles',
      through: { attributes: [] }, // Oculta tabla intermedia
    };

    // Filtro por rol
    if (rol) {
      includeRoles.where = {
        nombre: rol
      };
      includeRoles.required = true; // INNER JOIN
    }

    // ==========================
    // CONSULTA
    // ==========================
    const { count, rows } = await Usuario.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      include: [includeRoles],
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
          ...user,
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
const obtenerUsuarioPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const usuario = await Usuario.findByPk(id, {
      attributes: { exclude: ["password"] },
      include: [
        {
          model: Roles,
          as: 'roles',
          attributes: ['nombre'],
          through: { attributes: [] } // oculta tabla intermedia
        }
      ]
    });

    if (!usuario) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Convertir a JSON y mapear roles
    const user = usuario.toJSON();

    const usuarioFormateado = {
      ...user,
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
const crearUsuario = async (req, res) => {
  try {
    const {
      apellidos,
      correo,
      departamento,
      direccion,
      distrito,
      documento_identidad,
      nombre,
      provincia,
      roles,
      telefono,
    } = req.body;

    // Generar username automáticamente
    const username = documento_identidad;

    // Password inicial = DNI
    const password = documento_identidad;

    // Validar usuario existente
    const usuarioExistente = await Usuario.findOne({
      where: {
        [Op.or]: [
          { username },
          { documento_identidad },
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

      if (usuarioExistente.documento_identidad === documento_identidad) {
        return res.status(400).json({
          message: "El DNI ya está registrado"
        });
      }

      if (usuarioExistente.correo === correo) {
        return res.status(400).json({
          message: "El correo ya está registrado"
        });
      }

    }

    // Encriptar contraseña
    const passwordHash = await bcrypt.hash(password, 12);

    // Crear usuario
    const usuario = await Usuario.create({
      nombre,
      apellidos,
      username,
      password: passwordHash,
      correo,
      telefono,
      documento_identidad,
      direccion,
      departamento,
      provincia,
      distrito,
      estado: true
    });

    // Asignar roles
    // Soporta uno o varios roles
    const rolesArray = roles;

    // Buscar roles en BD
    const rolesDB = await Roles.findAll({
      where: {
        nombre: rolesArray
      }
    });

    if (!rolesDB || rolesDB.length === 0) {
      return res.status(400).json({
        message: "Rol(es) no válido(s)"
      });
    }

    // Asociar roles al usuario


    const relaciones = rolesDB.map((rol) => ({
      usuario_id: usuario.id,
      rol_id: rol.id,
    }));
    await UsuarioRol.bulkCreate(relaciones);


    res.status(201).json({
      message: "Usuario creado correctamente",
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        apellidos: usuario.apellidos,
        username: usuario.username,
        estado: usuario.estado,
        roles: rolesDB.map(r => r.nombre)
      }
    });

  } catch (error) {
    res.status(500).json({
      message: "Error al crear usuario",
      error: error.message,
    });
  }
};

// ======================================================
// 4. ACTUALIZAR USUARIO
// ======================================================
const actualizarUsuario = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { id } = req.params;
    const { roles, ...data } = req.body;

    const usuario = await Usuario.findByPk(id, { transaction: t });

    if (!usuario) {
      await t.rollback();
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Password
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 12);
    }

    // Actualizar usuario
    await usuario.update(data, { transaction: t });

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

      // 2. Eliminar roles actuales
      await UsuarioRol.destroy({
        where: { usuario_id: id },
        transaction: t
      });

      // 3. Insertar nuevos roles
      const nuevosRoles = rolesDB.map(r => ({
        usuario_id: id,
        rol_id: r.id
      }));

      await UsuarioRol.bulkCreate(nuevosRoles, { transaction: t });
    }

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
// 5. DESACTIVAR USUARIO (SOFT DELETE)
// ======================================================
const desactivarUsuario = async (req, res) => {
  try {
    const { id } = req.params;

    const usuario = await Usuario.findByPk(id);

    if (!usuario) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    usuario.estado = false;
    await usuario.save();

    res.json({ message: "Usuario desactivado correctamente" });
  } catch (error) {
    res.status(500).json({
      message: "Error al desactivar usuario",
      error: error.message,
    });
  }
};

// ======================================================
// 6. ACTIVAR USUARIO (SOFT DELETE)
// ======================================================
const activarUsuario = async (req, res) => {
  try {
    const { id } = req.params;

    const usuario = await Usuario.findByPk(id);

    if (!usuario) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    usuario.estado = true;
    await usuario.save();

    res.json({ message: "Usuario activado correctamente" });
  } catch (error) {
    res.status(500).json({
      message: "Error al desactivar usuario",
      error: error.message,
    });
  }
};

// ======================================================
// 7. ELIMINAR USUARIO
// ======================================================
const eliminarUsuario = async (req, res) => {
  try {
    const { id } = req.params;

    const usuario = await Usuario.findByPk(id);
    if (!usuario) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Eliminar usuario principal
    await usuario.destroy();

    res.json({ message: "Usuario eliminado correctamente" });
  } catch (error) {
    console.error("Error al eliminar usuario:", error);
    res.status(500).json({ message: "Error al eliminar usuario" });
  }
};

module.exports = {
  listarUsuarios,
  obtenerUsuarioPorId,
  crearUsuario,
  actualizarUsuario,
  desactivarUsuario,
  activarUsuario,
  eliminarUsuario
};
