module.exports = (db) => {
  // ======================================================
  // ALERTA - USUARIO EMISOR
  // ======================================================
  db.Alerta.belongsTo(db.Usuario, {
    foreignKey: "emisor_id",
    as: "emisor",
    // onUpdate: "CASCADE",
    // onDelete: "SET NULL",
  });

  db.Usuario.hasMany(db.Alerta, {
    foreignKey: "emisor_id",
    as: "alertasEmitidas",
    // onUpdate: "CASCADE",
    // onDelete: "SET NULL",
  });

  // ======================================================
  // ALERTA - ZONA
  // ======================================================
  db.Alerta.belongsTo(db.Zonas, {
    foreignKey: "zona_id",
    as: "zona",
    onUpdate: "CASCADE",
    onDelete: "SET NULL",
  });

  db.Zonas.hasMany(db.Alerta, {
    foreignKey: "zona_id",
    as: "alertas",
    onUpdate: "CASCADE",
    onDelete: "SET NULL",
  });

  // ======================================================
  // ALERTA - PATRULLAJE
  // ======================================================
  db.Alerta.belongsTo(db.PatrullajeProgramado, {
    foreignKey: "patrullaje_id",
    as: "patrullaje",
    onUpdate: "CASCADE",
    onDelete: "SET NULL",
  });

  db.PatrullajeProgramado.hasMany(db.Alerta, {
    foreignKey: "patrullaje_id",
    as: "alertas",
    onUpdate: "CASCADE",
    onDelete: "SET NULL",
  });

  // ======================================================
  // ALERTA - INCIDENCIA
  // ======================================================
  db.Alerta.belongsTo(db.Incidencia, {
    foreignKey: "incidencia_id",
    as: "incidencia",
    onUpdate: "CASCADE",
    onDelete: "SET NULL",
  });

  db.Incidencia.hasMany(db.Alerta, {
    foreignKey: "incidencia_id",
    as: "alertas",
    onUpdate: "CASCADE",
    onDelete: "SET NULL",
  });

  // ======================================================
  // ALERTA - DESTINATARIOS
  // ======================================================
  db.Alerta.hasMany(db.AlertaDestinatario, {
    foreignKey: "alerta_id",
    as: "destinatarios",
    onUpdate: "CASCADE",
    onDelete: "CASCADE",
  });

  db.AlertaDestinatario.belongsTo(db.Alerta, {
    foreignKey: "alerta_id",
    as: "alerta",
    onUpdate: "CASCADE",
    onDelete: "CASCADE",
  });

  // ======================================================
  // USUARIO - ALERTAS RECIBIDAS
  // ======================================================
  db.Usuario.hasMany(db.AlertaDestinatario, {
    foreignKey: "usuario_id",
    as: "alertasRecibidas",
    onUpdate: "CASCADE",
    onDelete: "CASCADE",
  });

  db.AlertaDestinatario.belongsTo(db.Usuario, {
    foreignKey: "usuario_id",
    as: "destinatario",
    onUpdate: "CASCADE",
    onDelete: "CASCADE",
  });

  // ======================================================
  // USUARIO - DISPOSITIVOS FCM
  // ======================================================
  db.Usuario.hasMany(db.UsuarioDispositivo, {
    foreignKey: "usuario_id",
    as: "dispositivos",
    onUpdate: "CASCADE",
    onDelete: "CASCADE",
  });

  db.UsuarioDispositivo.belongsTo(db.Usuario, {
    foreignKey: "usuario_id",
    as: "usuario",
    onUpdate: "CASCADE",
    onDelete: "CASCADE",
  });
};