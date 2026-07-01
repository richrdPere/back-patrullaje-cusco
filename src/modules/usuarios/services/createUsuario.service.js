const bcrypt = require("bcryptjs");
const { Op } = require("sequelize");

const db = require("../../../database/models");

// Models
const {
    sequelize,
    Usuario,
    Persona,
    Roles,
    UsuarioRol
} = db;

// Crear Usuario
const createUsuarioService = async (data) => {

    const {
        nombres,
        apellidos,
        correo,
        departamento,
        direccion,
        distrito,
        documento_identidad,
        provincia,
        telefono,
        roles
    } = data;

    // ==========================
    // USERNAME Y PASSWORD
    // ==========================
    const username = documento_identidad;
    const password = documento_identidad;

    // ==========================
    // VALIDAR PERSONA
    // ==========================
    const personaExistente = await Persona.findOne({
        where: {
            documento_identidad
        }
    });

    if (personaExistente) {
        throw new Error("El DNI ya está registrado.");
    }

    // ==========================
    // VALIDAR USUARIO
    // ==========================
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
            throw new Error("El nombre de usuario ya está registrado.");
        }

        if (usuarioExistente.correo === correo) {
            throw new Error("El correo ya está registrado.");
        }

    }

    // ==========================
    // VALIDAR ROLES
    // ==========================
    const rolesDB = await Roles.findAll({
        where: {
            nombre: roles
        }
    });

    if (!rolesDB.length) {
        throw new Error("Rol(es) no válido(s).");
    }

    // ==========================
    // PASSWORD
    // ==========================
    const passwordHash = await bcrypt.hash(
        password,
        12
    );

    // ==========================
    // TRANSACCIÓN
    // ==========================
    const resultado = await sequelize.transaction(async (t) => {

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

        const usuario = await Usuario.create({
            persona_id: persona.id,
            username,
            password: passwordHash,
            correo,
            estado: true

        }, { transaction: t });

        const relaciones = rolesDB.map(rol => ({

            usuario_id: usuario.id,
            rol_id: rol.id

        }));

        await UsuarioRol.bulkCreate(
            relaciones,
            { transaction: t }
        );

        return {
            usuario,
            persona
        };

    });

    return {
        id: resultado.usuario.id,
        username: resultado.usuario.username,
        correo: resultado.usuario.correo,
        estado: resultado.usuario.estado,
        persona: {
            id: resultado.persona.id,
            nombres: resultado.persona.nombres,
            apellidos: resultado.persona.apellidos,
            documento_identidad: resultado.persona.documento_identidad
        },
        roles: rolesDB.map(
            rol => rol.nombre
        )
    };
};

module.exports = createUsuarioService;