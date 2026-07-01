const db = require("../../../../database/models");

const { Policia, Persona } = db;

// ======================================================
// OBTENER POLICÍA POR ID
// ======================================================
const getPoliciaByIdService = async (id) => {

  const policia = await Policia.findByPk(id, {
    include: [
      {
        model: Persona,
        as: "persona"
      }
    ]
  });

  if (!policia) {
    return null;
  }

  return policia;

};

module.exports = getPoliciaByIdService;