/*global*/
const frontendHost =
  process.env.PLATFORM === 'linux' ? 'localhost' : 'host.docker.internal';
const SECTION = 'insights';
const APP_ID = 'advisor';
const routes = {};

routes[`/apps/${APP_ID}`] = { host: `http://${frontendHost}:8002` };
routes[`/preview/apps/${APP_ID}`] = { host: `http://${frontendHost}:8002` };
routes[`/preview/${SECTION}/${APP_ID}`] = {
  host: `http://${frontendHost}:8002`,
};
routes[`/${SECTION}/${APP_ID}`] = { host: `http://${frontendHost}:8002` };

module.exports = { routes };
