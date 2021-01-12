/*global module*/
const frontendHost = (process.env.PLATFORM === 'linux') ? 'localhost' : 'host.docker.internal';
const SECTION = 'insights';
const APP_ID = 'advisor';
const routes = {};

routes[`/apps/${APP_ID}`] = { host: `http://${frontendHost}:8002` };
routes[`/beta/apps/${APP_ID}`] = { host: `http://${frontendHost}:8002` };
routes[`/beta/${SECTION}/${APP_ID}`] = { host: `http://${frontendHost}:8002`  };
routes[`/${SECTION}/${APP_ID}`] = { host: `http://${frontendHost}:8002`  };

/**
 * Main.yml
 */
routes[`/config`] = { host: `http://${frontendHost}:8003`  };

/**
 * Dashboard
 */
routes[`/beta/insights/dashboard`] = { host: 'http://localhost:8004' };
routes[`/insights/dashboard`] = { host: 'http://localhost:8004' };
routes[`/beta/apps/dashboard`] = { host: 'http://localhost:8004' };
routes[`/apps/dashboard`] = { host: 'http://localhost:8004' };

/**
 * Inventory
 */
routes['/rhcs/inventory'] = { host: `https://localhost:8005` };
routes['/insights/inventory'] = { host: `https://localhost:8005` };
routes['/apps/inventory'] = { host: `https://localhost:8005` };

module.exports = { routes };
