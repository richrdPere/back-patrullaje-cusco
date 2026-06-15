const initAuthAssociations = require('./auth.associations');
const initPatrullajeAssociations = require('./patrullaje.associations');
const initIncidenciasAssociations = require('./incidencias.associations');
const initAlertasAssociations = require('./alertas.associations');
const initGpsAssociations = require('./gps.associations');
const initChatAssociations = require('./chat.associations');

const initAssociations = () => {
  initAuthAssociations();
  initPatrullajeAssociations();
  initIncidenciasAssociations();
  initAlertasAssociations();
  initGpsAssociations();
  initChatAssociations();
};

module.exports = initAssociations;