
// Service
const getOcurrenciasPaginadas = require('./getOcurrenciasPaginadas.service');

const LIMITE_POR_PAGINA = 100;
const MAXIMO_EXPORTACION = 5000;

const getOcurrenciasExportables = async ({
    usuarioId,
    roles,
    filtros,
}) => {
    const registros = [];

    let pagina = 1;
    let totalPaginas = 1;

    do {
        const resultado =
            await getOcurrenciasPaginadas({
                usuarioId,
                roles,

                ...filtros,

                page: pagina,
                limit: LIMITE_POR_PAGINA,
            });

        registros.push(...resultado.items);
        totalPaginas = resultado.pagination.totalPages;
        pagina += 1;

        if (
            registros.length >=
            MAXIMO_EXPORTACION
        ) {
            break;
        }
    } while (pagina <= totalPaginas);

    return registros.slice(0, MAXIMO_EXPORTACION);
};

module.exports = getOcurrenciasExportables;