/* global exports */
const host = `https://insights-advisor-api-advisor-ci.5a9f.insights-dev.openshiftapps.com/v1`;
const localhost = (process.env.PLATFORM === 'linux') ? 'localhost' : 'host.docker.internal';

exports.routes = {
    '/rule/': { host },
    '/stats/': { host },
    '/system/': { host },
    '/systemtype/': { host },
    '/apps/chrome': { host: 'https://ci.cloud.paas.upshift.redhat.com' },
    '/apps/insights/': { host: `http://${localhost}:8002` },
    '/insights': { host: `http://${localhost}:8002` }
};
