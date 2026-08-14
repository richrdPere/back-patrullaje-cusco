// services/ocurrencias/personas/
// registrar-personas-ocurrencia.service.js

const db = require('../../../../../database/models');

// Modelos
const { OcurrenciaPersona, } = db;

// Service
const validarPersonaOcurrencia = require('../personas/validarPersonaOcurrencia.service',);

// Utils
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

// SERVICES
const registrarPersonasOcurrencia = async ({
    ocurrenciaId,
    personas = [],
    esBorrador = true,
    transaction,
}) => {
    if (!Array.isArray(personas)) {
        const error = new Error(
            'El campo personas debe ser un arreglo.',
        );

        error.statusCode = 400;
        error.code =
            'PERSONAS_FORMATO_INVALIDO';

        throw error;
    }

    if (personas.length === 0) {
        return [];
    }

    if (personas.length > 100) {
        const error = new Error(
            'No se pueden registrar más de 100 personas por ocurrencia.',
        );

        error.statusCode = 422;
        error.code =
            'LIMITE_PERSONAS_EXCEDIDO';

        throw error;
    }

    const registros = personas.map(
        (persona, index) => {
            validarPersonaOcurrencia({
                persona,
                esBorrador,
                index,
            });

            const esComunidad =
                persona.es_comunidad === true;

            const fuenteDatos = esComunidad
                ? 'COMUNIDAD'
                : (
                    persona.fuente_datos ||
                    'DIRECTA'
                );

            return {
                ocurrencia_id:
                    ocurrenciaId,

                orden:
                    Number(persona.orden) ||
                    index + 1,

                tipo_persona:
                    persona.tipo_persona,

                identificado:
                    esComunidad
                        ? false
                        : persona.identificado === true,

                documento_identidad:
                    esComunidad
                        ? null
                        : limpiarTexto(
                            persona.documento_identidad,
                        ),

                nombres_apellidos:
                    esComunidad
                        ? 'COMUNIDAD'
                        : fuenteDatos ===
                            'CONSULTA_SUNARP'
                            ? 'CONSULTA SUNARP'
                            : limpiarTexto(
                                persona.nombres_apellidos,
                            ),

                genero:
                    esComunidad
                        ? null
                        : persona.genero || null,

                edad:
                    esComunidad ||
                        persona.edad === null ||
                        persona.edad === undefined
                        ? null
                        : Number(persona.edad),

                edad_es_aproximada:
                    esComunidad
                        ? false
                        : persona
                            .edad_es_aproximada === true,

                placa:
                    esComunidad
                        ? null
                        : limpiarTexto(
                            persona.placa,
                        ),

                caracteristicas_fisicas:
                    esComunidad
                        ? null
                        : limpiarTexto(
                            persona
                                .caracteristicas_fisicas,
                        ),

                es_comunidad:
                    esComunidad,

                fuente_datos:
                    fuenteDatos,

                observacion:
                    limpiarTexto(
                        persona.observacion,
                    ),

                estado: true,
            };
        },
    );

    return OcurrenciaPersona.bulkCreate(
        registros,
        {
            transaction,
            validate: true,
            returning: true,
        },
    );
};

module.exports = registrarPersonasOcurrencia;