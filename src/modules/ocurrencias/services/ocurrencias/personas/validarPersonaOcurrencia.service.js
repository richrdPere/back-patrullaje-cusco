// services/ocurrencias/personas/
// validar-persona-ocurrencia.service.js

const TIPOS_PERSONA = [
    'AUTOR',
    'AGRESOR',
    'CONDUCTOR',
    'VICTIMA',
    'BENEFICIARIO',
];

const GENEROS = [
    'MASCULINO',
    'FEMENINO',
    'NO_DETERMINADO',
];

const FUENTES = [
    'DIRECTA',
    'REFERENCIAL',
    'CONSULTA_SUNARP',
    'COMUNIDAD',
];

const crearError = (
    message,
    code,
) => {
    const error = new Error(message);

    error.statusCode = 422;
    error.code = code;

    return error;
};

const validarPersonaOcurrencia = ({
    persona,
    esBorrador = true,
    index = 0,
}) => {
    const posicion = index + 1;

    if (!persona) {
        throw crearError(
            `La persona ${posicion} no es válida.`,
            'PERSONA_INVALIDA',
        );
    }

    if (!TIPOS_PERSONA.includes(persona.tipo_persona)) {
        throw crearError(
            `El tipo de la persona ${posicion} no es válido.`,
            'TIPO_PERSONA_INVALIDO',
        );
    }

    if (persona.genero && !GENEROS.includes(persona.genero)) {
        throw crearError(
            `El género de la persona ${posicion} no es válido.`,
            'GENERO_PERSONA_INVALIDO',
        );
    }

    const fuente = persona.fuente_datos || 'DIRECTA';

    if (!FUENTES.includes(fuente)) {
        throw crearError(
            `La fuente de datos de la persona ${posicion} no es válida.`,
            'FUENTE_PERSONA_INVALIDA',
        );
    }

    if (
        persona.edad !== null &&
        persona.edad !== undefined
    ) {
        const edad = Number(persona.edad);

        if (
            !Number.isInteger(edad) ||
            edad < 0 ||
            edad > 130
        ) {
            throw crearError(
                `La edad de la persona ${posicion} no es válida.`,
                'EDAD_PERSONA_INVALIDA',
            );
        }
    }

    if (persona.es_comunidad) {
        if (
            ![
                'VICTIMA',
                'BENEFICIARIO',
            ].includes(persona.tipo_persona)
        ) {
            throw crearError(
                'La comunidad solo puede registrarse como víctima o beneficiaria.',
                'TIPO_COMUNIDAD_INVALIDO',
            );
        }

        return true;
    }

    if (
        fuente === 'CONSULTA_SUNARP' &&
        persona.tipo_persona !== 'CONDUCTOR'
    ) {
        throw crearError(
            'CONSULTA_SUNARP solo puede utilizarse para conductores.',
            'FUENTE_SUNARP_INVALIDA',
        );
    }

    /*
     * Como BORRADOR se permiten datos incompletos.
     * Para el envío definitivo se aplicarán reglas estrictas.
     */
    if (!esBorrador) {
        if (persona.identificado) {
            if (
                !String(
                    persona.nombres_apellidos || '',
                ).trim()
            ) {
                throw crearError(
                    `Debe ingresar los nombres de la persona ${posicion}.`,
                    'NOMBRE_PERSONA_REQUERIDO',
                );
            }
        } else if (
            fuente !== 'CONSULTA_SUNARP'
        ) {
            if (!persona.genero) {
                throw crearError(
                    `Debe ingresar el género de la persona no identificada ${posicion}.`,
                    'GENERO_NO_IDENTIFICADO_REQUERIDO',
                );
            }

            if (
                persona.edad === null ||
                persona.edad === undefined
            ) {
                throw crearError(
                    `Debe ingresar la edad aproximada de la persona ${posicion}.`,
                    'EDAD_APROXIMADA_REQUERIDA',
                );
            }
        }
    }

    return true;
};

module.exports = validarPersonaOcurrencia;