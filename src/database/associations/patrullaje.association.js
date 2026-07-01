module.exports = (db) => {

  // ZONA - PATRULLAJE
  db.PatrullajeProgramado.belongsTo(db.Zonas, {
    foreignKey: "zona_id",
    as: "zona"
  });

  db.Zonas.hasMany(db.PatrullajeProgramado, {
    foreignKey: "zona_id"
  });

  // UNIDAD
  db.PatrullajeProgramado.belongsTo(
    db.UnidadPatrullaje,
    {
      foreignKey: "unidad_id",
      as: "unidad"
    }
  );

  db.UnidadPatrullaje.hasMany(
    db.PatrullajeProgramado,
    {
      foreignKey: "unidad_id"
    }
  );

  // N:N Usuarios
  db.PatrullajeProgramado.belongsToMany(
    db.Usuario,
    {
      through: "PatrullajeUsuario",
      foreignKey: "patrullaje_id",
      otherKey: "usuario_id"
    }
  );

  db.Usuario.belongsToMany(
    db.PatrullajeProgramado,
    {
      through: "PatrullajeUsuario",
      foreignKey: "usuario_id",
      otherKey: "patrullaje_id"
    }
  );

  // Personal
  db.PatrullajeProgramado.hasMany(
    db.PatrullajePersonal,
    {
      foreignKey: "patrullaje_id",
      as: "personal"
    }
  );

  db.PatrullajePersonal.belongsTo(
    db.PatrullajeProgramado,
    {
      foreignKey: "patrullaje_id",
      as: "patrullaje"
    }
  );

  // Historial
  db.PatrullajeProgramado.hasMany(
    db.HistorialPatrullaje,
    {
      foreignKey: "patrullaje_id",
      as: "historial"
    }
  );

  db.HistorialPatrullaje.belongsTo(
    db.PatrullajeProgramado,
    {
      foreignKey: "patrullaje_id",
      as: "patrullaje"
    }
  );

  db.HistorialPatrullaje.belongsTo(
    db.Usuario,
    {
      foreignKey: "usuario_id",
      as: "usuario"
    }
  );

  db.Usuario.hasMany(
    db.HistorialPatrullaje,
    {
      foreignKey: "usuario_id",
      as: "historiales"
    }
  );

  db.HistorialPatrullaje.belongsTo(
    db.Zonas,
    {
      foreignKey: "zona_id",
      as: "zona"
    }
  );

  db.Zonas.hasMany(
    db.HistorialPatrullaje,
    {
      foreignKey: "zona_id",
      as: "historiales"
    }
  );

  // GPS Patrullaje
  db.PatrullajeProgramado.hasMany(
    db.PatrullajeGps,
    {
      foreignKey: "patrullaje_id",
      as: "gps"
    }
  );

  db.PatrullajeGps.belongsTo(
    db.PatrullajeProgramado,
    {
      foreignKey: "patrullaje_id",
      as: "patrullaje"
    }
  );

};