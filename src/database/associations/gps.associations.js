module.exports = (db) => {

  db.Usuario.hasMany(db.Gps, {
    foreignKey: "usuario_id",
    as: "gps_registros"
  });

  db.Gps.belongsTo(db.Usuario, {
    foreignKey: "usuario_id",
    as: "usuario"
  });

};