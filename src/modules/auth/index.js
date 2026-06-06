const controllers = require('./controllers');
const services = require('./services');
const validations = require('./validations');
const repositories = require('./repositories');
const authRoutes = require('./routes/auth.routes');

module.exports = {
  controllers,
  services,
  validations,
  repositories,
  authRoutes,
};