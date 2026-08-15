const generarOcurrenciaJson = (
    ocurrencia,
    {
        generadoPor = null,
    } = {},
) => {
    const data =
        typeof ocurrencia.toJSON === 'function'
            ? ocurrencia.toJSON()
            : ocurrencia;

    return {
        metadata: {
            tipo_documento: 'FORMATO_OCURRENCIA_SERENAZGO',
            numero_ocurrencia: data.numero_ocurrencia,
            estado_documento: data.estado === 'BORRADOR'
                ? 'BORRADOR'
                : data.estado,
            generado_por: generadoPor,
            fecha_generacion: new Date().toISOString(),
            version_formato: '1.0',
        },

        ocurrencia: data,
    };
};

module.exports = generarOcurrenciaJson;