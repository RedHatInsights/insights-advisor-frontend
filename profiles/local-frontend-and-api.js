/*global module*/

const APP_ID = 'insights';
const FRONTEND_PORT = 8002;
const API_PORT = 8888;
const routes = {};

// frontend rules

routes[`/beta/${APP_ID}`]      = { host: `http://localhost:${FRONTEND_PORT}` };
routes[`/${APP_ID}`]           = { host: `http://localhost:${FRONTEND_PORT}` };
routes[`/beta/apps/${APP_ID}`] = { host: `http://localhost:${FRONTEND_PORT}` };
routes[`/apps/${APP_ID}`]      = { host: `http://localhost:${FRONTEND_PORT}` };

// api rules
routes[`/api/${APP_ID}`]       = { host: `http://localhost:${API_PORT}` };

module.exports = { routes };
