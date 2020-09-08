/*global module*/
const apiHost = `https://cloud.redhat.com`;
const frontendHost = (process.env.PLATFORM === 'linux') ? 'localhost' : 'host.docker.internal';
const SECTION = 'insights';
const APP_ID = 'advisor';
const routes = {};

routes[`/api/${SECTION}/v1/`] = { host: apiHost };
routes[`/apps/${SECTION}`] = { host: `http://${frontendHost}:8002` };
routes[`/apps/${APP_ID}`] = { host: `http://${frontendHost}:8002` };
routes[`/beta/apps/${APP_ID}`] = { host: `http://${frontendHost}:8002` };
routes[`/beta/${SECTION}/${APP_ID}`] = { host: `http://${frontendHost}:8002`  };
routes[`/${SECTION}`] = { host: `http://${frontendHost}:8002` };
routes[`/${SECTION}/${APP_ID}`] = { host: `http://${frontendHost}:8002`  };

module.exports = { routes };
