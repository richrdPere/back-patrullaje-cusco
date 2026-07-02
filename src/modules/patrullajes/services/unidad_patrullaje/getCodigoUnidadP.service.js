const db = require("../../../../database/models");

// Modelos
const { UnidadPatrullaje } = db;

const getCodigoUnidadPService = async () => {

  const ultimaUnidad = await UnidadPatrullaje.findOne({

    order: [
      ["id", "DESC"]
    ]

  });

  let siguienteNumero = 1;

  if (
    ultimaUnidad &&
    ultimaUnidad.codigo
  ) {

    const numeroActual =
      parseInt(
        ultimaUnidad.codigo.split("-")[1]
      );

    siguienteNumero =
      numeroActual + 1;

  }

  return `UP-${String(
    siguienteNumero
  ).padStart(4, "0")}`;

}

module.exports = getCodigoUnidadPService;