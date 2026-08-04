module.exports = (db) => {

  // ======================================================
  // ZONA - PATRULLAJE
  // ======================================================
  db.PatrullajeProgramado.belongsTo(db.Zonas, {
    foreignKey: "zona_id",
    as: "zona",
    onUpdate: "CASCADE",
    onDelete: "RESTRICT"
  });

  db.Zonas.hasMany(db.PatrullajeProgramado, {
    foreignKey: "zona_id",
    as: "patrullaje",
    onUpdate: "CASCADE",
    onDelete: "RESTRICT"
  });

  // ======================================================
  // UNIDAD - PATRULLAJE
  // ======================================================
  db.PatrullajeProgramado.belongsTo(db.UnidadPatrullaje, {
    foreignKey: "unidad_id",
    as: "unidad",
    onUpdate: "CASCADE",
    onDelete: "SET NULL"
  });

  db.UnidadPatrullaje.hasMany(db.PatrullajeProgramado, {
    foreignKey: "unidad_id",
    as: "patrullaje",
    onUpdate: "CASCADE",
    onDelete: "SET NULL"
  });

  // ======================================================
  // PATRULLAJE - PERSONAL
  // ======================================================
  db.PatrullajeProgramado.hasMany(db.PatrullajePersonal, {
    foreignKey: "patrullaje_id",
    as: "personal",
    onUpdate: "CASCADE",
    onDelete: "CASCADE"
  });

  db.PatrullajePersonal.belongsTo(db.PatrullajeProgramado, {
    foreignKey: "patrullaje_id",
    as: "patrullaje",
    onUpdate: "CASCADE",
    onDelete: "CASCADE"
  });

  // ======================================================
  // USUARIO - PERSONAL
  // ======================================================
  db.Usuario.hasMany(db.PatrullajePersonal, {
    foreignKey: "usuario_id",
    as: "asignaciones",
    onUpdate: "CASCADE",
    onDelete: "SET NULL"
  });

  db.PatrullajePersonal.belongsTo(db.Usuario, {
    foreignKey: "usuario_id",
    as: "usuario",
    onUpdate: "CASCADE",
    onDelete: "SET NULL"
  });

  // ======================================================
  // POLICÍA - PERSONAL
  // ======================================================
  db.Policia.hasMany(db.PatrullajePersonal, {
    foreignKey: "policia_id",
    as: "asignaciones",
    onUpdate: "CASCADE",
    onDelete: "SET NULL"
  });

  db.PatrullajePersonal.belongsTo(db.Policia, {
    foreignKey: "policia_id",
    as: "policia",
    onUpdate: "CASCADE",
    onDelete: "SET NULL"
  });

  // ======================================================
  // HISTORIAL PATRULLAJE
  // ======================================================
  db.PatrullajeProgramado.hasMany(db.HistorialPatrullaje, {
    foreignKey: "patrullaje_id",
    as: "historial",
    onUpdate: "CASCADE",
    onDelete: "CASCADE"
  });

  db.HistorialPatrullaje.belongsTo(db.PatrullajeProgramado, {
    foreignKey: "patrullaje_id",
    as: "patrullaje_programado",
    onUpdate: "CASCADE",
    onDelete: "CASCADE"
  });

  db.HistorialPatrullaje.belongsTo(db.Usuario, {
    foreignKey: "usuario_id",
    as: "usuario",
    onUpdate: "CASCADE",
    onDelete: "SET NULL"
  });

  db.Usuario.hasMany(db.HistorialPatrullaje, {
    foreignKey: "usuario_id",
    as: "historiales",
    onUpdate: "CASCADE",
    onDelete: "SET NULL"
  });

  db.HistorialPatrullaje.belongsTo(db.Zonas, {
    foreignKey: "zona_id",
    as: "zona",
    onUpdate: "CASCADE",
    onDelete: "RESTRICT"
  });

  db.Zonas.hasMany(db.HistorialPatrullaje, {
    foreignKey: "zona_id",
    as: "historiales",
    onUpdate: "CASCADE",
    onDelete: "RESTRICT"
  });

  // ======================================================
  // RESUMEN PATRULLAJE
  // ======================================================
  db.PatrullajeProgramado.hasOne(db.PatrullajeResumen, {
    foreignKey: "patrullaje_id",
    as: "resumen",
    onUpdate: "CASCADE",
    onDelete: "CASCADE"
  });

  db.PatrullajeResumen.belongsTo(db.PatrullajeProgramado, {
    foreignKey: "patrullaje_id",
    as: "patrullaje",
    onUpdate: "CASCADE",
    onDelete: "CASCADE"
  });

  db.PatrullajeResumen.belongsTo(db.Usuario, {
    foreignKey: "usuario_finaliza_id",
    as: "usuarioFinaliza",
    // onUpdate: "CASCADE",
    // onDelete: "SET NULL"
  });

  db.Usuario.hasMany(db.PatrullajeResumen, {
    foreignKey: "usuario_finaliza_id",
    as: "resumenesFinalizados",
    onUpdate: "CASCADE",
    onDelete: "SET NULL"
  });

  // ======================================================
  // GPS PATRULLAJE
  // ======================================================
  db.PatrullajeProgramado.hasMany(db.PatrullajeGps, {
    foreignKey: "patrullaje_id",
    as: "recorrido",
    onUpdate: "CASCADE",
    onDelete: "CASCADE"
  });

  db.PatrullajeGps.belongsTo(db.PatrullajeProgramado, {
    foreignKey: "patrullaje_id",
    as: "patrullaje",
    onUpdate: "CASCADE",
    onDelete: "CASCADE"
  });
};