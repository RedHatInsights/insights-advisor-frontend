/*global module*/

const APP_ID = 'insights';
const routes = {};

routes[`/beta/${APP_ID}`]      = { host: 'http://localhost:8002' };
routes[`/${APP_ID}`]           = { host: 'http://localhost:8002' };
routes[`/beta/apps/${APP_ID}`] = { host: 'http://localhost:8002' };
routes[`/apps/${APP_ID}`]      = { host: 'http://localhost:8002' };

module.exports = { routes };
