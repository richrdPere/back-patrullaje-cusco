module.exports = (db) => {

  // ======================================================
  // ZONA - PATRULLAJE
  // ======================================================
  db.PatrullajeProgramado.belongsTo(db.Zonas, {
    foreignKey: "zona_id",
    as: "zona"
  });

  db.Zonas.hasMany(db.PatrullajeProgramado, {
    foreignKey: "zona_id",
    as: "patrullajes"
  });

  // ======================================================
  // UNIDAD - PATRULLAJE
  // ======================================================
  db.PatrullajeProgramado.belongsTo(db.UnidadPatrullaje, {
    foreignKey: "unidad_id",
    as: "unidad"
  });

  db.UnidadPatrullaje.hasMany(db.PatrullajeProgramado, {
    foreignKey: "unidad_id",
    as: "patrullajes"
  });

  // ======================================================
  // PERSONAL (PATRULLAJE_PERSONAL)
  // ======================================================
  db.PatrullajeProgramado.hasMany(db.PatrullajePersonal, {
    foreignKey: "patrullaje_id",
    as: "personal"
  });

  db.PatrullajePersonal.belongsTo(db.PatrullajeProgramado, {
    foreignKey: "patrullaje_id",
    as: "patrullaje"
  });

  // USUARIO - ASIGNACIONES
  db.Usuario.hasMany(db.PatrullajePersonal, {
    foreignKey: "usuario_id",
    as: "asignaciones"
  });

  db.PatrullajePersonal.belongsTo(db.Usuario, {
    foreignKey: "usuario_id",
    as: "usuario"
  });

  // ======================================================
  // HISTORIAL PATRULLAJE
  // ======================================================
  db.PatrullajeProgramado.hasMany(db.HistorialPatrullaje, {
    foreignKey: "patrullaje_id",
    as: "historial"
  });

  db.HistorialPatrullaje.belongsTo(db.PatrullajeProgramado, {
    foreignKey: "patrullaje_id",
    as: "patrullaje"
  });

  db.HistorialPatrullaje.belongsTo(db.Usuario, {
    foreignKey: "usuario_id",
    as: "usuario"
  });

  db.Usuario.hasMany(db.HistorialPatrullaje, {
    foreignKey: "usuario_id",
    as: "historiales"
  });

  db.HistorialPatrullaje.belongsTo(db.Zonas, {
    foreignKey: "zona_id",
    as: "zona"
  });

  db.Zonas.hasMany(db.HistorialPatrullaje, {
    foreignKey: "zona_id",
    as: "historiales"
  });

  // ======================================================
  // GPS PATRULLAJE
  // ======================================================
  db.PatrullajeProgramado.hasMany(db.PatrullajeGps, {
    foreignKey: "patrullaje_id",
    as: "gps"
  });

  db.PatrullajeGps.belongsTo(db.PatrullajeProgramado, {
    foreignKey: "patrullaje_id",
    as: "patrullaje"
  });

};