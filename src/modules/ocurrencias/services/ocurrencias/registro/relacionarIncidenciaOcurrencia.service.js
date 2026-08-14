const { Op } = require('sequelize');
const db = require('../../../../../database/models');

// Modelos
const {
    Incidencia,
    IncidenciaArchivo,
    Ocurrencia,
} = db;

// Utils
const crearError = (
    message,
    statusCode,
    code,
) => {
    const error = new Error(message);

    error.statusCode = statusCode;
    error.code = code;

    return error;
};

// SERVICES
const relacionarIncidenciaOcurrencia = async ({ incidenciaId = null, serenoId, transaction, }) => {
    if (
        incidenciaId === null ||
        incidenciaId === undefined ||
        incidenciaId === ''
    ) {
        return {
            incidencia: null,
            datosPrecargados: {},
            evidenciasReutilizables: [],
        };
    }

    const parsedIncidenciaId =
        Number(incidenciaId);

    if (!Number.isInteger(parsedIncidenciaId) || parsedIncidenciaId <= 0) {
        throw crearError(
            'El identificador de la incidencia no es válido.',
            400,
            'INCIDENCIA_ID_INVALIDO',
        );
    }


    const incidencia = await Incidencia.findByPk(
        parsedIncidenciaId,
        {
            transaction,
            lock: transaction.LOCK.UPDATE,
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
        Number(incidencia.usuario_id) !==
        Number(serenoId)
    ) {
        throw crearError(
            'La incidencia no pertenece al sereno autenticado.',
            403,
            'INCIDENCIA_NO_AUTORIZADA',
        );
    }

    const ocurrenciaExistente =
        await Ocurrencia.findOne({
            where: {
                incidencia_id: parsedIncidenciaId,

                estado: {
                    [Op.ne]: 'ANULADA',
                },
            },

            transaction,
        });

    if (ocurrenciaExistente) {
        throw crearError(
            `La incidencia ya está relacionada con la ocurrencia ${ocurrenciaExistente.numero_ocurrencia || ocurrenciaExistente.id}.`,
            409,
            'INCIDENCIA_CON_OCURRENCIA_ACTIVA',
        );
    }

    let evidenciasReutilizables = [];

    if (IncidenciaArchivo) {
        evidenciasReutilizables =
            await IncidenciaArchivo.findAll({
                where: {
                    incidencia_id: parsedIncidenciaId,
                    estado: 'ACTIVO',
                },

                transaction,
            });
    }

    return {
        incidencia,
        datosPrecargados: {
            patrullaje_id: incidencia.patrullaje_id || null,
            zona_id: incidencia.zona_id || null,
            latitud: incidencia.latitud ?? null,
            longitud: incidencia.longitud ?? null,
            datos_importantes: incidencia.descripcion
                ? String(
                    incidencia.descripcion,
                )
                    .trim()
                    .slice(0, 140)
                : null,
        },

        evidenciasReutilizables,
    };
};

module.exports = relacionarIncidenciaOcurrencia;