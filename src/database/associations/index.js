module.exports = (db) => {
  
  // - Auth
  require('./auth.association')(db);

  // - Patrullaje
  require('./patrullaje.association')(db);

  // - Incidencia
  require('./incidencias.association')(db);

  // - Chat
  require('./chat.associations')(db);

  // - Alertas
  require('./alertas.associations')(db);

  // - Gps
  require('./gps.associations')(db);

}
