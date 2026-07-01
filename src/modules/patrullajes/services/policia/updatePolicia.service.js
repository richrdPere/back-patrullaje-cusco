const db = require("../../../../database/models");

const { sequelize, Policia, Persona } = db;

// ======================================================
// ACTUALIZAR POLICÍA
// ======================================================
const updatePoliciaService = async (id, data) => {

  const t = await sequelize.transaction();

  try {

    // ==========================
    // BUSCAR POLICÍA
    // ==========================
    const policia = await Policia.findByPk(id);

    if (!policia) {
      await t.rollback();
      return {
        ok: false,
        status: 404,
        message: "Policía no encontrado"
      };
    }

    // ==========================
    // BUSCAR PERSONA
    // ==========================
    const persona = await Persona.findByPk(policia.persona_id);

    if (!persona) {
      await t.rollback();
      return {
        ok: false,
        status: 404,
        message: "Persona asociada no encontrada"
      };
    }

    // ==========================
    // ACTUALIZAR PERSONA
    // ==========================
    await persona.update({
      nombres: data.nombres,
      apellidos: data.apellidos,
      telefono: data.telefono,
      direccion: data.direccion,
      departamento: data.departamento,
      provincia: data.provincia,
      distrito: data.distrito
    }, { transaction: t });

    // ==========================
    // ACTUALIZAR POLICÍA
    // ==========================
    await policia.update({
      grado: data.grado,
      comisaria: data.comisaria,
      codigo_institucional: data.codigo_institucional
    }, { transaction: t });

    await t.commit();

    return {
      ok: true,
      message: "Policía actualizado correctamente"
    };

  } catch (error) {

    await t.rollback();

    return {
      ok: false,
      status: 500,
      message: "Error al actualizar policía",
      error: error.message
    };

  }
};

module.exports = updatePoliciaService;