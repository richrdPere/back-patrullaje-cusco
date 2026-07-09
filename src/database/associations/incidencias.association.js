module.exports = (db) => {

  // ==========================
  // USUARIO -> INCIDENCIA
  // ==========================
  db.Usuario.hasMany(db.Incidencia, {
    foreignKey: "usuario_id"
  });

  db.Incidencia.belongsTo(db.Usuario, {
    foreignKey: "usuario_id",
    as: "usuario"
  });

  // ==========================
  // ZONA -> INCIDENCIA
  // ==========================
  db.Zonas.hasMany(db.Incidencia, {
    foreignKey: "zona_id",
    as: "incidencias"
  });

  db.Incidencia.belongsTo(db.Zonas, {
    foreignKey: "zona_id",
    as: "zona"
  });

  // ==========================
  // INCIDENCIA -> ARCHIVOS
  // ==========================
  db.Incidencia.hasMany(db.IncidenciaArchivo, {
    foreignKey: "incidencia_id",
    as: "archivos"
  });

  db.IncidenciaArchivo.belongsTo(db.Incidencia, {
    foreignKey: "incidencia_id"
  });

  // ==========================
  // INCIDENCIA -> HISTORIAL
  // ==========================
  db.Incidencia.hasMany(db.HistorialPatrullaje, {
    foreignKey: "incidencia_id",
    as: "historial"
  });

  db.HistorialPatrullaje.belongsTo(db.Incidencia, {
    foreignKey: "incidencia_id",
    as: "incidencia"
  });

};