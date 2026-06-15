Incidencia.hasMany(IncidenciaArchivo)

IncidenciaArchivo.belongsTo(Incidencia)

Usuario.hasMany(Incidencia)

Incidencia.belongsTo(Usuario)


Incidencia.belongsTo(Zonas, {
  foreignKey: "zona_id",
  as: "zona"
});

Zonas.hasMany(Incidencia, {
  foreignKey: "zona_id",
  as: "incidencias"
});