// utils/ocurrencias/get-anio-registro.util.js

const getAnioRegistro = () => {
    const formato = new Intl.DateTimeFormat(
        'en-US',
        {
            timeZone: 'America/Lima',
            year: 'numeric',
        },
    );

    return Number(formato.format(new Date()));
};

module.exports = getAnioRegistro;