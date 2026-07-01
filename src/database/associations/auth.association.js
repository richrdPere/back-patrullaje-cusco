module.exports = (db) => {

    // PERSONA - USUARIO
    db.Persona.hasOne(db.Usuario, {
        foreignKey: "persona_id",
        as: "usuario"
    });

    db.Usuario.belongsTo(db.Persona, {
        foreignKey: "persona_id",
        as: "persona"
    });

    // USUARIO - ROLES
    db.Usuario.belongsToMany(db.Roles, {
        through: db.UsuarioRol,
        foreignKey: "usuario_id",
        otherKey: "rol_id",
        as: "roles"
    });

    db.Roles.belongsToMany(db.Usuario, {
        through: db.UsuarioRol,
        foreignKey: "rol_id",
        otherKey: "usuario_id",
        as: "usuarios"
    });

    // USUARIO - USUARIO ROL
    db.Usuario.hasMany(db.UsuarioRol, {
        foreignKey: "usuario_id",
        as: "usuarioRoles"
    });

    db.UsuarioRol.belongsTo(db.Usuario, {
        foreignKey: "usuario_id",
        as: "usuario"
    });

    db.Roles.hasMany(db.UsuarioRol, {
        foreignKey: "rol_id",
        as: "usuarioRoles"
    });

    db.UsuarioRol.belongsTo(db.Roles, {
        foreignKey: "rol_id",
        as: "rol"
    });

    // PERSONA - POLICIA
    db.Persona.hasOne(db.Policia, {
        foreignKey: "persona_id",
        as: "policia"
    });

    db.Policia.belongsTo(db.Persona, {
        foreignKey: "persona_id",
        as: "persona"
    });

};