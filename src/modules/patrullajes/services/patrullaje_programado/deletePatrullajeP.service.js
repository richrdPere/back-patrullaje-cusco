const db = require("../../../../database/models");

const {
    sequelize,
    PatrullajeProgramado,
    PatrullajePersonal
} = db;

// Eliminar Patrullaje Programado
const deletePatrullajePService = async (id) => {

    return await sequelize.transaction(async (t) => {

        // ==========================
        // BUSCAR PATRULLAJE
        // ==========================

        const patrullaje =
            await PatrullajeProgramado.findByPk(id, {
                transaction: t
            });

        if (!patrullaje) {
            throw new Error("Patrullaje no encontrado.");
        }

        // ==========================
        // ELIMINAR PERSONAL
        // ==========================

        await PatrullajePersonal.destroy({

            where: {
                patrullaje_id: patrullaje.id
            },

            transaction: t

        });

        // ==========================
        // ELIMINAR PATRULLAJE
        // ==========================

        await patrullaje.destroy({
            transaction: t
        });
        return true;
    });

};

module.exports = deletePatrullajePService;