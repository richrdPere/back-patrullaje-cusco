module.exports = (db) => {

  db.Usuario.hasMany(db.Incidencia, {
    foreignKey: "usuario_id"
  });

  db.Incidencia.belongsTo(db.Usuario, {
    foreignKey: "usuario_id",
    as: "usuario"
  });

  db.Zonas.hasMany(db.Incidencia, {
    foreignKey: "zona_id",
    as: "incidencias"
  });

  db.Incidencia.belongsTo(db.Zonas, {
    foreignKey: "zona_id",
    as: "zona"
  });

  db.Incidencia.hasMany(db.IncidenciaArchivo, {
    foreignKey: "incidencia_id",
    as: "archivos"
  });

  db.IncidenciaArchivo.belongsTo(db.Incidencia, {
    foreignKey: "incidencia_id"
  });

};