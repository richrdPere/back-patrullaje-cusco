const db = require("../../../database/models");

const {
    sequelize,
    HistorialPatrullaje,
    PatrullajeProgramado
} = db;

const archiveHistorialService = async (historialId, usuarioId) => {

    return await sequelize.transaction(async (t) => {

        // ==========================
        // BUSCAR HISTORIAL
        // ==========================
        const historial = await HistorialPatrullaje.findByPk(
            historialId,
            {
                include: [
                    {
                        model: PatrullajeProgramado,
                        as: "patrullaje"
                    }
                ],
                transaction: t
            }
        );

        if (!historial) {
            const error = new Error("El historial no existe.");
            error.statusCode = 404;
            throw error;
        }

        // ==========================
        // VALIDAR PROPIETARIO
        // ==========================
        if (historial.sereno_id !== usuarioId) {
            const error = new Error(
                "No tienes permiso para archivar este historial."
            );
            error.statusCode = 403;
            throw error;
        }

        // ==========================
        // VALIDAR ESTADO
        // ==========================
        if (historial.estado === "ARCHIVADO") {
            const error = new Error(
                "El historial ya se encuentra archivado."
            );
            error.statusCode = 400;
            throw error;
        }

        // ==========================
        // VALIDAR PATRULLAJE
        // ==========================
        if (historial.patrullaje.estado !== "EN_CURSO") {
            const error = new Error(
                "Solo se pueden archivar registros de patrullajes en curso."
            );
            error.statusCode = 400;
            throw error;
        }

        // ==========================
        // ARCHIVAR
        // ==========================
        historial.estado = "ARCHIVADO";

        await historial.update(
            {
                estado: "ARCHIVADO"
            },
            {
                transaction: t
            }
        );
        return historial;
    });
};

module.exports = archiveHistorialService;