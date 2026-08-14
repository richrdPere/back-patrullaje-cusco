const { QueryTypes } = require('sequelize');
const db = require('../../../../../database/models');

// Utils
const getAnioRegistro = require("../../../../../utils/getAnioRegistro");

// SERVICE
const generarNumeroOcurrencia = async ({ transaction, }) => {

  if (!transaction) {
    const error = new Error(
      'La generación del número de ocurrencia requiere una transacción.',
    );

    error.statusCode = 500;
    error.code =
      'TRANSACCION_CORRELATIVO_REQUERIDA';

    throw error;
  }

  const anio = getAnioRegistro();
  const now = new Date();


  await db.sequelize.query(
    `
      INSERT INTO ocurrencia_correlativos
      (
        anio,
        ultimo_numero,
        created_at,
        updated_at
      )
      VALUES
      (
        :anio,
        1,
        :now,
        :now
      )
      ON DUPLICATE KEY UPDATE
        ultimo_numero = ultimo_numero + 1,
        updated_at = :now
    `,
    {
      replacements: {
        anio,
        now,
      },

      type: QueryTypes.INSERT,
      transaction,
    },
  );

  /*
   * La misma transacción podrá leer el valor que acaba
   * de insertar o incrementar.
   */
  const correlativos =
    await db.sequelize.query(
      `
        SELECT
          id,
          anio,
          ultimo_numero
        FROM ocurrencia_correlativos
        WHERE anio = :anio
        LIMIT 1
        FOR UPDATE
      `,
      {
        replacements: {
          anio,
        },

        type: QueryTypes.SELECT,
        transaction,
      },
    );

  const correlativo = correlativos[0];

  if (!correlativo) {
    const error = new Error(
      'No se pudo recuperar el correlativo generado.',
    );

    error.statusCode = 500;
    error.code =
      'CORRELATIVO_NO_RECUPERADO';

    throw error;
  }

  const numero = Number(
    correlativo.ultimo_numero,
  );

  if (
    !Number.isInteger(numero) ||
    numero <= 0
  ) {
    const error = new Error(
      'El correlativo generado no es válido.',
    );

    error.statusCode = 500;
    error.code =
      'CORRELATIVO_INVALIDO';

    throw error;
  }

  if (numero > 999999) {
    const error = new Error(
      `Se agotó el correlativo de ocurrencias para el año ${anio}.`,
    );

    error.statusCode = 500;
    error.code =
      'CORRELATIVO_ANUAL_AGOTADO';

    throw error;
  }

  const numeroFormateado =
    String(numero).padStart(6, '0');

  return {
    anio,
    correlativo: numero,
    numero_ocurrencia:
      `OCU-${anio}-${numeroFormateado}`,
  };
};

module.exports = generarNumeroOcurrencia;