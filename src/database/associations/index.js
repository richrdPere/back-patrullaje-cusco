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


// const initAuthAssociations = require('./auth.association');
// const initPatrullajeAssociations = require('./patrullaje.association');
// const initIncidenciasAssociations = require('./incidencias.association');
// const initAlertasAssociations = require('./alertas.associations');
// const initGpsAssociations = require('./gps.associations');
// const initChatAssociations = require('./chat.associations');

// const initAssociations = (db) => {

//   initAuthAssociations(db);
//   initPatrullajeAssociations(db);
//   initIncidenciasAssociations(db);
//   initAlertasAssociations(db);
//   initGpsAssociations(db);
//   initChatAssociations(db);

// };

// module.exports = initAssociations;