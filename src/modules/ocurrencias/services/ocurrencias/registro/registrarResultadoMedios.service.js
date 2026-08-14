const db = require('../../../../../database/models');

const {
    OcurrenciaConsecuencia,
    OcurrenciaMedioEmpleado,
} = db;

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

const registrarResultadoMedios = async ({
    ocurrenciaId,
    consecuencias = [],
    mediosEmpleados = [],
    transaction,
}) => {
    let consecuenciasCreadas = [];
    let mediosCreados = [];

    if (consecuencias.length > 0) {
        consecuenciasCreadas =
            await OcurrenciaConsecuencia.bulkCreate(
                consecuencias.map(
                    (consecuencia) => ({
                        ocurrencia_id:
                            ocurrenciaId,

                        tipo:
                            consecuencia.tipo,

                        descripcion:
                            limpiarTexto(
                                consecuencia.descripcion,
                            ),

                        estado: true,
                    }),
                ),
                {
                    transaction,
                    validate: true,
                    returning: true,
                },
            );
    }

    if (mediosEmpleados.length > 0) {
        mediosCreados =
            await OcurrenciaMedioEmpleado.bulkCreate(
                mediosEmpleados.map(
                    (medio) => ({
                        ocurrencia_id:
                            ocurrenciaId,

                        tipo:
                            medio.tipo,

                        descripcion:
                            limpiarTexto(
                                medio.descripcion,
                            ),

                        estado: true,
                    }),
                ),
                {
                    transaction,
                    validate: true,
                    returning: true,
                },
            );
    }

    return {
        consecuencias:
            consecuenciasCreadas,

        medios_empleados:
            mediosCreados,
    };
};

module.exports = registrarResultadoMedios;