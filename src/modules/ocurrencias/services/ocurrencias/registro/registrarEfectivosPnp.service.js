// services/ocurrencias/efectivos/
// registrar-efectivos-pnp.service.js

const { Op } = require('sequelize');
const db = require('../../../../../database/models');

const {
    PatrullajePersonal,
    Policia,
    Persona,
    OcurrenciaEfectivoPnp,
} = db;

const crearError = (
    message,
    code,
) => {
    const error = new Error(message);

    error.statusCode = 422;
    error.code = code;

    return error;
};

const limpiarTexto = (value) => {
    if (
        value === null ||
        value === undefined
    ) {
        return null;
    }

    const texto = String(value).trim();

    return texto || null;
};

const obtenerPoliciaCatalogado = async ({
    policiaId,
    transaction,
}) => {
    const policia = await Policia.findByPk(
        policiaId,
        {
            include: [
                {
                    model: Persona,
                    as: 'persona',
                    required: true,
                },
            ],

            transaction,
        },
    );

    if (!policia) {
        throw crearError(
            `El policía ${policiaId} no existe en el catálogo.`,
            'POLICIA_NO_ENCONTRADO',
        );
    }

    return {
        policia_id:
            policia.id,

        apellidos:
            policia.persona.apellidos,

        nombres:
            policia.persona.nombres,

        grado:
            policia.grado,

        comisaria:
            policia.comisaria,

        codigo_institucional:
            policia.codigo_institucional,

        fuente_registro:
            'CATALOGO',
    };
};

const obtenerPoliciasPatrullaje = async ({
    patrullajeId,
    transaction,
}) => {
    if (!patrullajeId) {
        return [];
    }

    const asignaciones =
        await PatrullajePersonal.findAll({
            where: {
                /*
                 * Ajusta este nombre si tu modelo utiliza
                 * patrullaje_programado_id.
                 */
                patrullaje_id: patrullajeId,
                tipo: 'POLICIA',
                policia_id: {
                    [Op.ne]: null,
                },
                estado: {
                    [Op.in]: [
                        'ASIGNADO',
                        'ACEPTADO',
                        'EN_SERVICIO',
                        'FINALIZADO',
                    ],
                },
            },

            attributes: [
                'id',
                'policia_id',
            ],

            transaction,
        });

    return asignaciones.map(
        (asignacion) =>
            asignacion.policia_id,
    );
};

const registrarEfectivosPnp = async ({
    ocurrenciaId,
    patrullajeId = null,
    modalidadPatrullaje = null,
    efectivosPnp = [],
    transaction,
}) => {
    if (!Array.isArray(efectivosPnp)) {
        throw crearError(
            'El campo efectivos_pnp debe ser un arreglo.',
            'EFECTIVOS_PNP_FORMATO_INVALIDO',
        );
    }

    const efectivosCombinados = [
        ...efectivosPnp,
    ];

    /*
     * Reutilizar policías asignados mediante
     * PatrullajePersonal.
     */
    const policiasAsignados =
        await obtenerPoliciasPatrullaje({
            patrullajeId,
            transaction,
        });

    for (
        const policiaId
        of policiasAsignados
    ) {
        const yaFueEnviado =
            efectivosCombinados.some(
                (efectivo) =>
                    Number(efectivo.policia_id) ===
                    Number(policiaId),
            );

        if (!yaFueEnviado) {
            efectivosCombinados.push({
                policia_id:
                    policiaId,

                tipo_participacion:
                    modalidadPatrullaje ===
                        'INTEGRADO'
                        ? 'PATRULLAJE_INTEGRADO'
                        : 'APOYO',
            });
        }
    }

    /*
     * Patrullaje integrado: debe existir al menos
     * un policía catalogado o manual.
     */
    if (
        modalidadPatrullaje ===
        'INTEGRADO' &&
        efectivosCombinados.length === 0
    ) {
        throw crearError(
            'Debe registrar al menos un efectivo PNP para un patrullaje integrado.',
            'EFECTIVO_PNP_REQUERIDO',
        );
    }

    const idsCatalogados = new Set();
    const registros = [];

    for (
        const efectivo
        of efectivosCombinados
    ) {
        const tipoParticipacion =
            efectivo.tipo_participacion ||
            (
                modalidadPatrullaje ===
                    'INTEGRADO'
                    ? 'PATRULLAJE_INTEGRADO'
                    : 'APOYO'
            );

        if (
            tipoParticipacion === 'OTRO' &&
            !String(
                efectivo.tipo_participacion_otro ||
                '',
            ).trim()
        ) {
            throw crearError(
                'Debe especificar el otro tipo de participación del efectivo PNP.',
                'TIPO_PARTICIPACION_PNP_REQUERIDO',
            );
        }

        if (efectivo.policia_id) {
            const policiaId =
                Number(efectivo.policia_id);

            if (idsCatalogados.has(policiaId)) {
                continue;
            }

            idsCatalogados.add(policiaId);

            const catalogado =
                await obtenerPoliciaCatalogado({
                    policiaId,
                    transaction,
                });

            registros.push({
                ocurrencia_id:
                    ocurrenciaId,

                ...catalogado,

                tipo_participacion:
                    tipoParticipacion,

                tipo_participacion_otro:
                    tipoParticipacion === 'OTRO'
                        ? limpiarTexto(
                            efectivo
                                .tipo_participacion_otro,
                        )
                        : null,

                observacion:
                    limpiarTexto(
                        efectivo.observacion,
                    ),

                estado: true,
            });

            continue;
        }

        /*
         * Registro manual.
         */
        const apellidos =
            limpiarTexto(
                efectivo.apellidos,
            );

        const nombres =
            limpiarTexto(
                efectivo.nombres,
            );

        if (!apellidos || !nombres) {
            throw crearError(
                'Los nombres y apellidos son obligatorios para un efectivo PNP no catalogado.',
                'DATOS_PNP_MANUAL_REQUERIDOS',
            );
        }

        registros.push({
            ocurrencia_id: ocurrenciaId,
            policia_id: null,
            apellidos,
            nombres,
            grado: limpiarTexto(efectivo.grado),
            comisaria: limpiarTexto(efectivo.comisaria,),
            codigo_institucional: limpiarTexto(efectivo.codigo_institucional,),
            fuente_registro: 'MANUAL',
            tipo_participacion: tipoParticipacion,
            tipo_participacion_otro: tipoParticipacion === 'OTRO'
                ? limpiarTexto(
                    efectivo.tipo_participacion_otro,
                )
                : null,

            observacion: limpiarTexto(efectivo.observacion,),
            estado: true,
        });
    }

    if (registros.length === 0) {
        return [];
    }

    return OcurrenciaEfectivoPnp.bulkCreate(
        registros,
        {
            transaction,
            validate: true,
            returning: true,
        },
    );
};

module.exports = registrarEfectivosPnp;