module.exports = (db) => {

    db.Conversacion.hasMany(
        db.ConversacionParticipante,
        {
            foreignKey: "conversacion_id",
            as: "participantes"
        }
    );

    db.ConversacionParticipante.belongsTo(
        db.Conversacion,
        {
            foreignKey: "conversacion_id",
            as: "conversacion"
        }
    );

    db.Usuario.hasMany(
        db.ConversacionParticipante,
        {
            foreignKey: "usuario_id",
            as: "conversaciones"
        }
    );

    db.ConversacionParticipante.belongsTo(
        db.Usuario,
        {
            foreignKey: "usuario_id",
            as: "usuario"
        }
    );

    db.Conversacion.hasMany(
        db.Mensaje,
        {
            foreignKey: "conversacion_id",
            as: "mensajes"
        }
    );

    db.Mensaje.belongsTo(
        db.Conversacion,
        {
            foreignKey: "conversacion_id",
            as: "conversacion"
        }
    );

    db.Usuario.hasMany(
        db.Mensaje,
        {
            foreignKey: "usuario_id",
            as: "mensajes"
        }
    );

    db.Mensaje.belongsTo(
        db.Usuario,
        {
            foreignKey: "usuario_id",
            as: "usuario"
        }
    );

    db.Mensaje.hasMany(
        db.MensajeLectura,
        {
            foreignKey: "mensaje_id",
            as: "lecturas"
        }
    );

    db.MensajeLectura.belongsTo(
        db.Mensaje,
        {
            foreignKey: "mensaje_id",
            as: "mensaje"
        }
    );

    db.Usuario.hasMany(
        db.MensajeLectura,
        {
            foreignKey: "usuario_id",
            as: "mensajesLeidos"
        }
    );

    db.MensajeLectura.belongsTo(
        db.Usuario,
        {
            foreignKey: "usuario_id",
            as: "usuario"
        }
    );

};