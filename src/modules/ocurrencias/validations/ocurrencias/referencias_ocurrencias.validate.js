// services/ocurrencias/registro/validar-referencias-ocurrencia.service.js

const db = require('../../../../database/models');

const {
    Incidencia,
    PatrullajeProgramado,
} = db;

const crearError = (
    message,
    statusCode = 400,
    code = 'VALIDATION_ERROR',
) => {
    const error = new Error(message);

    error.statusCode = statusCode;
    error.code = code;

    return error;
};


const validarReferenciasOcurrencia = async ({
    incidenciaId = null,
    patrullajeId = null,
    serenoId,
    transaction = null,
}) => {
    let incidencia = null;
    let patrullaje = null;

    // =====================================================
    // INCIDENCIA OPCIONAL
    // =====================================================

    if (incidenciaId !== null && incidenciaId !== undefined) {
        const parsedIncidenciaId = Number(incidenciaId);

        if (
            !Number.isInteger(parsedIncidenciaId) ||
            parsedIncidenciaId <= 0
        ) {
            throw crearError(
                'El identificador de la incidencia no es válido.',
                400,
                'INCIDENCIA_ID_INVALIDO',
            );
        }

        incidencia = await Incidencia.findByPk(
            parsedIncidenciaId,
            {
                transaction,
            },
        );

        if (!incidencia) {
            throw crearError(
                'La incidencia indicada no existe.',
                404,
                'INCIDENCIA_NO_ENCONTRADA',
            );
        }

        if (
            incidencia.usuario_id &&
            Number(incidencia.usuario_id) !== Number(serenoId)
        ) {
            throw crearError(
                'La incidencia no pertenece al sereno autenticado.',
                403,
                'INCIDENCIA_NO_AUTORIZADA',
            );
        }
    }

    // =====================================================
    // PATRULLAJE OPCIONAL
    // =====================================================

    if (patrullajeId !== null && patrullajeId !== undefined) {
        const parsedPatrullajeId = Number(patrullajeId);

        if (
            !Number.isInteger(parsedPatrullajeId) ||
            parsedPatrullajeId <= 0
        ) {
            throw crearError(
                'El identificador del patrullaje no es válido.',
                400,
                'PATRULLAJE_ID_INVALIDO',
            );
        }

        patrullaje =
            await PatrullajeProgramado.findByPk(
                parsedPatrullajeId,
                {
                    transaction,
                },
            );

        if (!patrullaje) {
            throw crearError(
                'El patrullaje indicado no existe.',
                404,
                'PATRULLAJE_NO_ENCONTRADO',
            );
        }
    }

    // =====================================================
    // COHERENCIA INCIDENCIA - PATRULLAJE
    // =====================================================

    if (
        incidencia &&
        patrullaje &&
        incidencia.patrullaje_id &&
        Number(incidencia.patrullaje_id) !==
        Number(patrullaje.id)
    ) {
        throw crearError(
            'La incidencia no pertenece al patrullaje indicado.',
            422,
            'INCIDENCIA_PATRULLAJE_INCONSISTENTE',
        );
    }

    return {
        incidencia,
        patrullaje,
    };
};

module.exports = validarReferenciasOcurrencia;