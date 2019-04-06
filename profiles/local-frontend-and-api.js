/*global module*/

const APP_ID = 'insights';
const API_PORT = 8888;
const routes = {};

// frontend rules
routes[`/beta/${APP_ID}`]      = { host: 'http://localhost:8002' };
routes[`/${APP_ID}`]           = { host: 'http://localhost:8002' };
routes[`/beta/apps/${APP_ID}`] = { host: 'http://localhost:8002' };
routes[`/apps/${APP_ID}`]      = { host: 'http://localhost:8002' };

// api rules
routes[`/api/${APP_ID}`]       = { host: `http://localhost:${API_PORT}` };

module.exports = { routes };
