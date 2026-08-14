// utils/ocurrencias/clasificador.util.js

const validarJerarquiaCodigos = ({
    codigoGenerico,
    codigoEspecifico,
    codigoModalidad,
}) => {
    if (!/^\d{2}$/.test(codigoGenerico)) {
        return {
            valido: false,
            mensaje: 'El código genérico debe contener 2 dígitos.',
        };
    }

    if (!/^\d{4}$/.test(codigoEspecifico)) {
        return {
            valido: false,
            mensaje: 'El código específico debe contener 4 dígitos.',
        };
    }

    if (!/^\d{6}$/.test(codigoModalidad)) {
        return {
            valido: false,
            mensaje: 'El código de modalidad debe contener 6 dígitos.',
        };
    }

    if (!codigoEspecifico.startsWith(codigoGenerico)) {
        return {
            valido: false,
            mensaje: 'El código específico no pertenece a la categoría genérica.',
        };
    }

    if (!codigoModalidad.startsWith(codigoEspecifico)) {
        return {
            valido: false,
            mensaje: 'La modalidad no pertenece a la categoría específica.',
        };
    }

    return {
        valido: true,
        mensaje: null,
    };
};

module.exports = {
    validarJerarquiaCodigos,
};