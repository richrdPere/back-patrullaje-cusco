module.exports = (db) => {

    db.Alerta.belongsTo(db.Usuario, {
        foreignKey: "usuario_id"
    });

    db.Usuario.hasMany(db.Alerta, {
        foreignKey: "usuario_id"
    });

    db.Alerta.belongsTo(db.Zonas, {
        foreignKey: "zona_id"
    });

    db.Zonas.hasMany(db.Alerta, {
        foreignKey: "zona_id"
    });

    db.Alerta.belongsTo(db.PatrullajeProgramado, {
        foreignKey: "patrullaje_id"
    });

    db.PatrullajeProgramado.hasMany(db.Alerta, {
        foreignKey: "patrullaje_id"
    });

};