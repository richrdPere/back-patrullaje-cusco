const db = require("../../../../database/models");

// Models
const { sequelize, Persona, Policia } = db;

// Crear Policia
const createPoliciaService = async (data) => {

  const t = await sequelize.transaction();

  try {

    const {
      nombres,
      apellidos,
      documento_identidad,
      telefono,
      direccion,
      departamento,
      provincia,
      distrito,
      grado,
      comisaria,
      codigo_institucional
    } = data;

    // VALIDAR DUPLICADO PERSONA
    const existePersona = await Persona.findOne({
      where: { documento_identidad }
    });

    if (existePersona) {
      await t.rollback();
      return {
        ok: false,
        status: 400,
        message: "El DNI ya está registrado"
      };
    }

    // CREAR PERSONA
    const persona = await Persona.create({
      nombres,
      apellidos,
      documento_identidad,
      telefono,
      direccion,
      departamento,
      provincia,
      distrito
    }, { transaction: t });

    // CREAR POLICÍA
    const policia = await Policia.create({
      persona_id: persona.id,
      grado,
      comisaria,
      codigo_institucional
    }, { transaction: t });

    await t.commit();

    return {
      ok: true,
      data: {
        policia,
        persona
      }
    };

  } catch (error) {

    await t.rollback();

    return {
      ok: false,
      status: 500,
      message: "Error al crear policía",
      error: error.message
    };

  }
};

module.exports = createPoliciaService;