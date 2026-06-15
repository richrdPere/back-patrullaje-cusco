const sequelize = require("../config/database");

const Usuario = require("./auth/usuario.model");
const Zonas = require("./catalogos/zonas.model");
const Gps = require("./gps/gps.model");
const Patrullaje = require("./patrullaje/patrullaje_programado.model");
const Alerta = require("./alertas/alerta.model");
const UnidadPatrullaje = require("./catalogos/unidad_patrullaje.model");
const UnidadSereno = require("./catalogos/unidad_sereno.model");
const PatrullajeProgramado = require("./patrullaje/patrullaje_programado.model");
const Roles = require("./auth/roles.model");
const UsuarioRol = require("./auth/usuario_role.model");
const Policia = require("./auth/policia.model");
const PatrullajePersonal = require("./patrullaje/patrullaje_personal.model");
const PatrullajeGps = require("./patrullaje/patrullaje_gps.model");
const Incidencia = require("./incidencias/incidencia.model");
const IncidenciaArchivo = require('./incidencias/incidencia_archivo.model');
const Persona = require("./auth/persona.model");
const HistorialPatrullaje = require("./patrullaje/historial_patrullaje.model");

const Conversacion = require("./chat/conversacion.model");
const ConversacionParticipante = require("./chat/conversacion_participantes.model");
const Mensaje = require("./chat/mensaje.model");
const MensajeLectura = require("./chat/mensaje_lectura.model");

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
db.Persona = Persona;
db.HistorialPatrullaje = HistorialPatrullaje;
db.Conversacion = Conversacion;
db.ConversacionParticipante = ConversacionParticipante;
db.Mensaje = Mensaje;
db.MensajeLectura = MensajeLectura;

// =========================================
// ASOCIACIONES ENTRE MODELOS
// =========================================

// =============================
// PERSONA - USUARIO (1:1)
// =============================
db.Persona.hasOne(db.Usuario, { foreignKey: "persona_id", as: "usuario" });
db.Usuario.belongsTo(db.Persona, { foreignKey: "persona_id", as: "persona" });

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
// PATRULLAJE PROGRAMADO - HISTORIAL
// ================================
db.PatrullajeProgramado.hasMany(db.HistorialPatrullaje, {
  foreignKey: "patrullaje_id",
  as: "historial"
});

db.HistorialPatrullaje.belongsTo(db.PatrullajeProgramado, {
  foreignKey: "patrullaje_id",
  as: "patrullaje"
});

// ================================
// HISTORIAL - USUARIO
// ================================
db.HistorialPatrullaje.belongsTo(db.Usuario, {
  foreignKey: "usuario_id",
  as: "usuario"
});

db.Usuario.hasMany(db.HistorialPatrullaje, {
  foreignKey: "patrullaje_id",
  as: "historiales"
});

// ================================
// HISTORIAL - ZONAS
// ================================
db.HistorialPatrullaje.belongsTo(db.Zonas, {
  foreignKey: "zona_id",
  as: "zona"
});

db.Zonas.hasMany(db.HistorialPatrullaje, {
  foreignKey: "zona_id",
  as: "historiales"
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
// db.Usuario.hasOne(db.Policia, { foreignKey: "usuario_id", as: "policia" });
// db.Policia.belongsTo(db.Usuario, { foreignKey: "usuario_id", as: "usuario" });

db.Persona.hasOne(db.Policia, { foreignKey: "persona_id", as: "policia" });
db.Policia.belongsTo(db.Persona, { foreignKey: "persona_id", as: "persona" });



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

// ================================
// INCIDENCIA - ZONAS
// ================================
db.Incidencia.hasMany(db.Zonas, {
  foreignKey: "zona_id",
  as: "zona"
});

db.Zonas.belongsTo(db.Incidencia, {
  foreignKey: "incidentes"
});

// =========================
// CONVERSACIONES
// =========================
db.Conversacion.hasMany(db.ConversacionParticipante, {
  foreignKey: "conversacion_id",
  as: "participantes",
});

db.ConversacionParticipante.belongsTo(db.Conversacion, {
  foreignKey: "conversacion_id",
  as: "conversacion",
});


// =========================
// USUARIOS
// =========================
db.Usuario.hasMany(db.ConversacionParticipante, {
  foreignKey: "usuario_id",
  as: "conversaciones",
});

db.ConversacionParticipante.belongsTo(db.Usuario, {
  foreignKey: "usuario_id",
  as: "usuario",
});


// =========================
// MENSAJES
// =========================
db.Conversacion.hasMany(db.Mensaje, {
  foreignKey: "conversacion_id",
  as: "mensajes",
});

db.Mensaje.belongsTo(db.Conversacion, {
  foreignKey: "conversacion_id",
  as: "conversacion",
});


// =========================
// USUARIO MENSAJE
// =========================
db.Usuario.hasMany(db.Mensaje, {
  foreignKey: "usuario_id",
  as: "mensajes",
});

db.Mensaje.belongsTo(db.Usuario, {
  foreignKey: "usuario_id",
  as: "usuario",
});


// =========================
// LECTURAS
// =========================
db.Mensaje.hasMany(db.MensajeLectura, {
  foreignKey: "mensaje_id",
  as: "lecturas",
});

db.MensajeLectura.belongsTo(db.Mensaje, {
  foreignKey: "mensaje_id",
  as: "mensaje",
});

db.Usuario.hasMany(db.MensajeLectura, {
  foreignKey: "usuario_id",
  as: "mensajesLeidos",
});

db.MensajeLectura.belongsTo(db.Usuario, {
  foreignKey: "usuario_id",
  as: "usuario",
});


module.exports = db;