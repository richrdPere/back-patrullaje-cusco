// services/ocurrencias/registro/validar-modalidad-activa.service.js

const db = require('../../../../database/models');

const {
    OcurrenciaClasificadorVersion,
    OcurrenciaCategoriaGenerica,
    OcurrenciaCategoriaEspecifica,
    OcurrenciaModalidad,
    OcurrenciaModalidadRegla,
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

/**
 * Verifica que el código de ocurrencia exista y que toda
 * su jerarquía se encuentre activa.
 *
 * @param {string} codigo
 * @param {Object} options
 * @returns {Promise<Object>}
 */
const validarModalidadActiva = async (
    codigo,
    {
        transaction = null,
    } = {},
) => {
    const codigoLimpio = String(codigo || '').trim();

    if (!/^\d{6}$/.test(codigoLimpio)) {
        throw crearError(
            'El código de ocurrencia debe contener exactamente seis dígitos.',
            400,
            'CODIGO_OCURRENCIA_INVALIDO',
        );
    }

    const modalidad =
        await OcurrenciaModalidad.findOne({
            where: {
                codigo: codigoLimpio,
                estado: true,
            },

            include: [
                {
                    model: OcurrenciaCategoriaEspecifica,
                    as: 'categoria_especifica',
                    required: true,

                    where: {
                        estado: true,
                    },

                    include: [
                        {
                            model: OcurrenciaCategoriaGenerica,
                            as: 'categoria_generica',
                            required: true,

                            where: {
                                estado: true,
                            },

                            include: [
                                {
                                    model:
                                        OcurrenciaClasificadorVersion,
                                    as: 'version',
                                    required: true,

                                    where: {
                                        estado: true,
                                    },
                                },
                            ],
                        },
                    ],
                },

                {
                    model: OcurrenciaModalidadRegla,
                    as: 'reglas',
                    required: false,

                    where: {
                        estado: true,
                    },
                },
            ],

            transaction,
        });

    if (!modalidad) {
        throw crearError(
            'El código de ocurrencia no existe o se encuentra inactivo.',
            422,
            'CODIGO_OCURRENCIA_NO_DISPONIBLE',
        );
    }

    return modalidad;
};

module.exports = validarModalidadActiva;