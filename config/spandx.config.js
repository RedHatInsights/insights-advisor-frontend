/* global exports */
const openShiftAppsHost = `https://advisor-api-advisor-ci.5a9f.insights-dev.openshiftapps.com/v1`;

exports.routes = {
    '/rule/': { host: openShiftAppsHost },
    '/stats/': { host: openShiftAppsHost },
    '/system/': { host: openShiftAppsHost },
    '/systemtype/': { host: openShiftAppsHost }
};
