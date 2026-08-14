// services/ocurrencias/reglas/
// aplicar-reglas-personas.service.js

const obtenerClavePersona = (
    persona,
) => {
    const documento =
        String(
            persona.documento_identidad || '',
        ).trim();

    if (documento) {
        return `DOC:${documento}`;
    }

    const nombre =
        String(
            persona.nombres_apellidos || '',
        )
            .trim()
            .toUpperCase();

    const edad =
        persona.edad ?? '';

    const placa =
        String(persona.placa || '')
            .trim()
            .toUpperCase();

    return `DATOS:${nombre}:${edad}:${placa}`;
};

const tieneRegla = (
    modalidad,
    clave,
) => {
    return (modalidad.reglas || []).some(
        (regla) =>
            regla.clave === clave &&
            regla.estado !== false,
    );
};

const duplicarRol = ({
    personas,
    rolOrigen,
    rolDestino,
}) => {
    const resultado = [...personas];

    const origenes = resultado.filter(
        (persona) =>
            persona.tipo_persona ===
            rolOrigen,
    );

    for (const personaOrigen of origenes) {
        const claveOrigen =
            obtenerClavePersona(personaOrigen);

        const yaExisteDestino =
            resultado.some(
                (persona) =>
                    persona.tipo_persona ===
                    rolDestino &&
                    obtenerClavePersona(persona) ===
                    claveOrigen,
            );

        if (!yaExisteDestino) {
            resultado.push({
                ...personaOrigen,

                tipo_persona:
                    rolDestino,

                /*
                 * Se recalculará posteriormente
                 * dentro del grupo correspondiente.
                 */
                orden: undefined,

                observacion: [
                    personaOrigen.observacion,
                    `Registro generado automáticamente desde el rol ${rolOrigen}.`,
                ]
                    .filter(Boolean)
                    .join(' '),
            });
        }
    }

    return resultado;
};

const aplicarReglasPersonas = ({
    modalidad,
    personas = [],
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

    let resultado = [...personas];

    /*
     * 030103 y 030104:
     * conductor también es víctima.
     */
    if (
        tieneRegla(
            modalidad,
            'DUPLICAR_CONDUCTOR_COMO_VICTIMA',
        )
    ) {
        resultado = duplicarRol({
            personas: resultado,
            rolOrigen: 'CONDUCTOR',
            rolDestino: 'VICTIMA',
        });
    }

    /*
     * 060101 y 060102:
     * autor también es víctima.
     */
    if (
        tieneRegla(
            modalidad,
            'DUPLICAR_AUTOR_COMO_VICTIMA',
        )
    ) {
        resultado = duplicarRol({
            personas: resultado,
            rolOrigen: 'AUTOR',
            rolDestino: 'VICTIMA',
        });
    }

    /*
     * Recalcular orden dentro de cada tipo.
     */
    const contadores = {};

    return resultado.map((persona) => {
        const tipo =
            persona.tipo_persona;

        contadores[tipo] =
            (contadores[tipo] || 0) + 1;

        return {
            ...persona,
            orden: contadores[tipo],
        };
    });
};

module.exports = aplicarReglasPersonas;