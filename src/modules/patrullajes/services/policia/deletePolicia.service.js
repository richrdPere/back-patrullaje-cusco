const db = require("../../../../database/models");

const { sequelize, Policia, Persona } = db;

// ======================================================
// ELIMINAR POLICÍA
// ======================================================
const deletePoliciaService = async (id) => {

    const t = await sequelize.transaction();

    try {

        // ==========================
        // BUSCAR POLICÍA
        // ==========================
        const policia = await Policia.findByPk(id);

        if (!policia) {
            await t.rollback();
            return {
                ok: false,
                status: 404,
                message: "Policía no encontrado"
            };
        }

        // ==========================
        // BUSCAR PERSONA
        // ==========================
        const persona = await Persona.findByPk(policia.persona_id);

        // ==========================
        // ELIMINAR POLICÍA
        // ==========================
        await policia.destroy({ transaction: t });

        // ==========================
        // ELIMINAR PERSONA (SI EXISTE)
        // ==========================
        if (persona) {
            await persona.destroy({ transaction: t });
        }

        await t.commit();

        return {
            ok: true,
            message: "Policía eliminado correctamente"
        };

    } catch (error) {

        await t.rollback();

        return {
            ok: false,
            status: 500,
            message: "Error al eliminar policía",
            error: error.message
        };

    }
};

module.exports = deletePoliciaService;