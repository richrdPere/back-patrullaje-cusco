const db = require("../../../../database/models");

const { Policia, Persona } = db;

// ======================================================
// LISTAR TODOS LOS POLICÍAS (SELECT)
// ======================================================
const getPoliciasSelectService = async () => {

  const policias = await Policia.findAll({
    attributes: ['id', 'grado', 'comisaria'],
    include: [
      {
        model: Persona,
        as: "persona",
        attributes: ['nombres', 'apellidos', 'documento_identidad']
      }
    ],
    order: [
      [{ model: Persona, as: 'persona' }, 'nombres', 'ASC']
    ]
  });

  const data = policias.map(p => {

    const persona = p.persona;

    return {
      id: p.id,
      label: `${persona.nombres} ${persona.apellidos}`,
      dni: persona.documento_identidad,
      grado: p.grado,
      comisaria: p.comisaria,
      persona
    };

  });

  return data;

};

module.exports = getPoliciasSelectService;