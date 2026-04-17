const alertHandler = require("./handlers/alert.handler");
const trackingHandler = require("./handlers/tracking.handler");
const patrullajeHandler = require("./handlers/patrullaje.handler");
const notificationHandler = require("./handlers/notification.handler");

module.exports = (io, socket) => {
  alertHandler(io, socket);
  trackingHandler(io, socket);
  patrullajeHandler(io, socket);
  notificationHandler(io, socket);
};