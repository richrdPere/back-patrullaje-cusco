const db = require('../../../../../database/models');

// Modelo
const { OcurrenciaPersona } = db;

// Util
const calcularGrupo = (personas) => ({
    total:
        personas.filter(
            (persona) =>
                !persona.es_comunidad,
        ).length,

    comunidades:
        personas.filter(
            (persona) =>
                persona.es_comunidad,
        ).length,

    masculinos:
        personas.filter(
            (persona) =>
                !persona.es_comunidad &&
                persona.genero === 'MASCULINO',
        ).length,

    femeninos:
        personas.filter(
            (persona) =>
                !persona.es_comunidad &&
                persona.genero === 'FEMENINO',
        ).length,

    no_determinados:
        personas.filter(
            (persona) =>
                !persona.es_comunidad &&
                (
                    !persona.genero ||
                    persona.genero ===
                    'NO_DETERMINADO'
                ),
        ).length,

    mayores:
        personas.filter(
            (persona) =>
                !persona.es_comunidad &&
                persona.edad !== null &&
                Number(persona.edad) >= 18,
        ).length,

    menores:
        personas.filter(
            (persona) =>
                !persona.es_comunidad &&
                persona.edad !== null &&
                Number(persona.edad) < 18,
        ).length,
});

// SERVICES
const calcularResumenPersonas = async ({
    ocurrenciaId,
    transaction = null,
}) => {
    const personas =
        await OcurrenciaPersona.findAll({
            where: {
                ocurrencia_id: ocurrenciaId,
                estado: true,
            },

            transaction,
        });

    const autores = personas.filter(
        (persona) =>
            [
                'AUTOR',
                'AGRESOR',
                'CONDUCTOR',
            ].includes(persona.tipo_persona),
    );

    const victimas = personas.filter(
        (persona) =>
            [
                'VICTIMA',
                'BENEFICIARIO',
            ].includes(persona.tipo_persona),
    );

    return {
        general:
            calcularGrupo(personas),

        autores_agresores_conductores:
            calcularGrupo(autores),

        victimas_beneficiarios:
            calcularGrupo(victimas),
    };
};

module.exports = calcularResumenPersonas;