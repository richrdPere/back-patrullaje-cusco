const db = require("../../../database/models");

// Models
const { Usuario, Persona, Roles } = db;

// Obtener Usuario por ID
const getUsuarioByIdService = async (id) => {

    const usuario = await Usuario.findByPk(id, {

        attributes: {
            exclude: ["password"]
        },

        include: [
            {
                model: Persona,
                as: "persona",
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
                as: "roles",
                attributes: [
                    "id",
                    "nombre"
                ],
                through: {
                    attributes: []
                }
            }
        ]
    });

    if (!usuario) {
        throw new Error("Usuario no encontrado.");
    }

    const user = usuario.toJSON();

    return {
        id: user.id,
        username: user.username,
        correo: user.correo,
        estado: user.estado,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        persona: user.persona,
        roles: user.roles?.map(
            rol => rol.nombre
        ) || []
    };
};

module.exports = getUsuarioByIdService;