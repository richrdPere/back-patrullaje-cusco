const sequelize = require("../../config/database");

const db = {};

// CONEXIÓN
db.sequelize = sequelize;

// MODELOS

// - AUTH
Object.assign(db, require("./auth"));

// - CATÁLOGOS
Object.assign(db, require("./catalogos"));

// - GPS
Object.assign(db, require("./gps"));

// - PATRULLAJE
Object.assign(db, require("./patrullaje"));

// - ALERTAS
Object.assign(db, require("./alertas"));

// - INCIDENCIAS
Object.assign(db, require("./incidencias"));

// - CHAT
Object.assign(db, require("./chat"));

// - OCURRENCIAS 
Object.assign(db, require("./ocurrencias"));

// - OCURRENCIAS CLASIFICADORES
Object.assign(db, require("./ocurrencias_clasificadores"));




// CARGAR ASOCIACIONES
require("../associations")(db);

// EXPORT
module.exports = db;
