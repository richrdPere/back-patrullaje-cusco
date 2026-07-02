const db = require("../../../../database/models");

// Models
const {
  UnidadPatrullaje,
  Usuario,
  Persona,
  Roles
} = db;

const getSerenosByUnidadService =
  async (unidad_id) => {

    const unidad =       await UnidadPatrullaje.findByPk(

        unidad_id,
        {
          include: [
            {
              model: Usuario,
              as: "usuarios",
              through: {
                attributes: []
              },
              attributes: [
                "id",
                "username",
                "correo",
                "estado"
              ],

              include: [
                {
                  model: Persona,
                  as: "persona"
                },
                {
                  model: Roles,
                  as: "roles",
                  through: {
                    attributes: []
                  }
                }
              ]
            }
          ]
        }
      );
    if (!unidad) {
      throw new Error(
        "Unidad no encontrada."
      );
    }
    return unidad;
  }

module.exports = getSerenosByUnidadService;