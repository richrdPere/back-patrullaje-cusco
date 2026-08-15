// Utils
const formatOcurrenciaRow = require('../../../utils/exportacion/formatOcurrenciaRow');

const escaparCsv = (value) => {
  if (
    value === undefined ||
    value === null
  ) {
    return '';
  }

  const texto = String(value);

  return `"${texto.replace(/"/g, '""')}"`;
};

// SERVICES
const generarOcurrenciasCsv = (ocurrencias) => {
  const filas = ocurrencias.map(
    formatOcurrenciaRow,
  );

  const columnas = [
    'numero_ocurrencia',
    'codigo',
    'modalidad',
    'categoria_especifica',
    'categoria_generica',
    'fecha_ocurrencia',
    'turno',
    'sereno',
    'zona',
    'direccion',
    'latitud',
    'longitud',
    'resultado',
    'estado',
    'estado_remision',
    'fecha_registro',
  ];

  const encabezado =
    columnas.join(',');

  const contenido = filas.map(
    (fila) =>
      columnas
        .map((columna) =>
          escaparCsv(fila[columna]),
        )
        .join(','),
  );

  /*
   * BOM para que Excel reconozca correctamente
   * tildes y caracteres UTF-8.
   */
  return `\uFEFF${[
    encabezado,
    ...contenido,
  ].join('\n')}`;
};

module.exports = generarOcurrenciasCsv;