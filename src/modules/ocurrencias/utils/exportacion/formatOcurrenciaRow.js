const nombreSereno = (ocurrencia) => {
    const persona =
        ocurrencia.sereno?.persona;

    return [
        persona?.nombres,
        persona?.apellidos,
    ]
        .filter(Boolean)
        .join(' ')
        .trim();
};

const formatOcurrenciaRow = (item) => {
    const ocurrencia =
        typeof item.toJSON === 'function'
            ? item.toJSON()
            : item;

    return {
        numero_ocurrencia: ocurrencia.numero_ocurrencia,
        codigo: ocurrencia.modalidad?.codigo,
        modalidad: ocurrencia.modalidad?.nombre,
        categoria_especifica: ocurrencia.modalidad
            ?.categoria_especifica
            ?.nombre,
        categoria_generica: ocurrencia.modalidad
            ?.categoria_especifica
            ?.categoria_generica
            ?.nombre,
        fecha_ocurrencia: ocurrencia.fecha_ocurrencia,
        turno: ocurrencia.turno,
        sereno: nombreSereno(ocurrencia),
        zona: ocurrencia.zona?.nombre,
        direccion: ocurrencia.direccion,
        latitud: ocurrencia.latitud,
        longitud: ocurrencia.longitud,
        resultado: ocurrencia.resultado,
        estado: ocurrencia.estado,
        estado_remision: ocurrencia.estado_remision,
        fecha_registro: ocurrencia.created_at,
    };
};

module.exports = formatOcurrenciaRow;