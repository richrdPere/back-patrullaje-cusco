const db = require("../../../../database/models");

const {
    UnidadPatrullaje
} = db;

// Crear Unidad de Patrullaje
const crearUnidadPService = async (data) => {

    // ==========================
    // VALIDACIONES FUTURAS
    // ==========================
    // - Código único
    // - Placa única
    // - Tipo válido

    const unidad = await UnidadPatrullaje.create(data);

    return unidad;
};

module.exports = crearUnidadPService;