const sequelize = require("../config/database");
const Usuario = require("./usuario.model");
const Zonas = require("./zonas.model");
const Gps = require("./gps.model");
const Patrullaje = require("./patrullaje_programado.model");
const Alerta = require("./alerta.model");
const UnidadPatrullaje = require("./unidad_patrullaje.model");
const UnidadSereno = require("./unidad_sereno.model");
const PatrullajeProgramado = require("./patrullaje_programado.model");
const Roles = require("./roles.model");
const UsuarioRol = require("./usuario_role.model");
const Policia = require("./policia.model");
const PatrullajePersonal = require("./patrullaje_personal.model");
const PatrullajeGps = require("./patrullaje_gps.model");
const Incidencia = require("./incidencia.model");
const IncidenciaArchivo = require('./incidencia_archivo.model');

// Creamos un objeto db para centralizar todos los modelos y la instancia de Sequelize
const db = {};

// Aquí luego importaremos los modelos, por ejemplo:
db.sequelize = sequelize;

// Asignamos modelos al objeto db
db.Usuario = Usuario;
db.Zonas = Zonas;
db.Gps = Gps;
db.Patrullaje = Patrullaje;
db.Alerta = Alerta;
db.UnidadPatrullaje = UnidadPatrullaje;
db.UnidadSereno = UnidadSereno;
db.PatrullajeProgramado = PatrullajeProgramado;
db.Roles = Roles;
db.UsuarioRol = UsuarioRol;
db.Policia = Policia;
db.PatrullajePersonal = PatrullajePersonal;
db.PatrullajeGps = PatrullajeGps;
db.Incidencia = Incidencia;
db.IncidenciaArchivo = IncidenciaArchivo;

// =========================================
// ASOCIACIONES ENTRE MODELOS
// =========================================

// ================================
// USUARIO - GPS (1 a N)
// ================================
db.Gps.belongsTo(db.Usuario, { foreignKey: "usuario_id" });
db.Usuario.hasMany(db.Gps, { foreignKey: "usuario_id" });

// ================================
// ZONA - PATRULLAJE (1 a N)
// ================================
db.Patrullaje.belongsTo(db.Zonas, { foreignKey: "zona_id" });
db.Zonas.hasMany(db.Patrullaje, { foreignKey: "zona_id" });

// ================================
// PATRULLAJE - USUARIO (N a N)
// ================================
db.Patrullaje.belongsToMany(db.Usuario, {
  through: "PatrullajeUsuario",
  foreignKey: "patrullaje_id",
  otherKey: "usuario_id",
});

db.Usuario.belongsToMany(db.Patrullaje, {
  through: "PatrullajeUsuario",
  foreignKey: "usuario_id",
  otherKey: "patrullaje_id",
});


// ================================
// ALERTA - USUARIO
// ================================
db.Alerta.belongsTo(db.Usuario, { foreignKey: "usuario_id" });
db.Usuario.hasMany(db.Alerta, { foreignKey: "usuario_id" });

// ================================
// ALERTA - ZONA
// ================================
db.Alerta.belongsTo(db.Zonas, { foreignKey: "zona_id" });
db.Zonas.hasMany(db.Alerta, { foreignKey: "zona_id" });

// ================================
// ALERTA - PATRULLAJE (opcional)
// ================================
db.Alerta.belongsTo(db.Patrullaje, {
  foreignKey: "patrullaje_id",
  allowNull: true,
});
db.Patrullaje.hasMany(db.Alerta, { foreignKey: "patrullaje_id" });



// ================================
// UNIDAD - SERENO
// ================================
// Relación many-to-many
db.Usuario.belongsToMany(db.UnidadPatrullaje, {
  through: db.UnidadSereno,
  foreignKey: "usuario_id",
  otherKey: "unidad_id"
});

db.UnidadPatrullaje.belongsToMany(db.Usuario, {
  through: db.UnidadSereno,
  foreignKey: "unidad_id",
  otherKey: "usuario_id"
});


// ================================
// PATRULLAJE PROGRAMADO - UNIDAD
// ================================

db.PatrullajeProgramado.belongsTo(db.UnidadPatrullaje, {
  foreignKey: "unidad_id",
  as: "unidad"
});

db.UnidadPatrullaje.hasMany(db.PatrullajeProgramado, {
  foreignKey: "unidad_id"
});

// ================================
// PATRULLAJE PROGRAMADO - ZONA
// ================================

db.PatrullajeProgramado.belongsTo(db.Zonas, {
  foreignKey: "zona_id",
  as: "zona"
});

db.Zonas.hasMany(db.PatrullajeProgramado, {
  foreignKey: "zona_id"
});

// ================================
// PATRULLAJE PROGRAMADO - PATRULLAJE PERSONAL
// ================================
db.PatrullajeProgramado.hasMany(db.PatrullajePersonal, {
  as: "personal",
  foreignKey: "patrullaje_id",
});

db.PatrullajePersonal.belongsTo(db.PatrullajeProgramado, {
  as: "patrullaje",
  foreignKey: "patrullaje_id",
});

db.PatrullajePersonal.belongsTo(db.Usuario, {
  foreignKey: "personal_id",
  as: "usuario",
  constraints: false
});

db.PatrullajePersonal.belongsTo(db.Policia, {
  foreignKey: "personal_id",
  as: "policia",
  constraints: false
});

// ================================
// USUARIOS - ROLES
// ================================
db.Usuario.belongsToMany(db.Roles, {
  through: db.UsuarioRol,
  foreignKey: "usuario_id",
  as: "roles",
});

db.Roles.belongsToMany(db.Usuario, {
  through: db.UsuarioRol,
  foreignKey: "rol_id",
  as: "usuarios",
});


// ================================
// USUARIO - POLICIA
// ================================
db.Usuario.hasOne(db.Policia, {
  foreignKey: "usuario_id",
  as: "policia"
});

db.Policia.belongsTo(db.Usuario, {
  foreignKey: "usuario_id",
  as: "usuario"
});



// ================================
// USUARIO - GPS (1 a N)
// ================================
db.Usuario.hasMany(db.Gps, {
  foreignKey: "usuario_id",
  as: "gps_registros"
});

db.Gps.belongsTo(db.Usuario, {
  foreignKey: "usuario_id",
  as: "usuario"
});


// ================================
// PATRULLAJE - GPS
// ================================
db.PatrullajeProgramado.hasMany(db.PatrullajeGps, {
  foreignKey: "patrullaje_id",
  as: "gps"
});

db.PatrullajeGps.belongsTo(db.PatrullajeProgramado, {
  foreignKey: "patrullaje_id",
  as: "patrullaje"
});


// ================================
// INCIDENCIA - INCIDENCIA ARCHIVO
// ================================
db.Incidencia.hasMany(db.IncidenciaArchivo, {
  foreignKey: "incidencia_id",
  as: "archivos"
});

db.IncidenciaArchivo.belongsTo(db.Incidencia, {
  foreignKey: "incidencia_id"
});


// ================================
// USUARIO - INCIDENCIA 
// ================================
db.Usuario.hasMany(db.Incidencia, {
  foreignKey: "usuario_id"
});

db.Incidencia.belongsTo(db.Usuario, {
  foreignKey: "usuario_id",
  as: "usuario"
});


module.exports = db;