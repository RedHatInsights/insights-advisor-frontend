/*global module*/

const APP_ID = 'insights';
const FRONTEND_PORT = 8002;
const routes = {};

routes[`/beta/${APP_ID}`]      = { host: `http://localhost:${FRONTEND_PORT}` };
routes[`/${APP_ID}`]           = { host: `http://localhost:${FRONTEND_PORT}` };
routes[`/beta/apps/${APP_ID}`] = { host: `http://localhost:${FRONTEND_PORT}` };
routes[`/apps/${APP_ID}`]      = { host: `http://localhost:${FRONTEND_PORT}` };

module.exports = { routes };
