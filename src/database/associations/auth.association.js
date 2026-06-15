Persona.hasOne(Usuario)
Usuario.belongsTo(Persona)

Usuario.belongsToMany(Roles)
Roles.belongsToMany(Usuario)

Persona.hasOne(Policia)
Policia.belongsTo(Persona)