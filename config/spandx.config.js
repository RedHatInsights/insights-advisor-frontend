/* global exports */
const host = `https://ci.cloud.paas.psi.redhat.com`;
const localhost = (process.env.PLATFORM === 'linux') ? 'localhost' : 'host.docker.internal';

exports.routes = {
    '/rule/': { host },
    '/stats/': { host },
    '/system/': { host },
    '/systemtype/': { host },
    '/apps/chrome': { host },
    '/apps/insights/': { host: `http://${localhost}:8002` },
    '/insights': { host: `http://${localhost}:8002` }
};
