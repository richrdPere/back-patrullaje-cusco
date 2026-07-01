const db = require("../../../database/models");

const { Zonas } = db;

// ======================================================
// CREAR ZONA
// ======================================================
const createZonaService = async ({ nombre, descripcion, coordenadas, riesgo }) => {

  const zona = await Zonas.create({
    nombre,
    descripcion,
    coordenadas,
    riesgo
  });

  return zona;

};

module.exports = createZonaService;