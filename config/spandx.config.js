/* global exports */
const openShiftAppsHost = `https://advisor-api-advisor-ci.1b13.insights.openshiftapps.com/v1`;

exports.routes = {
    '/rule/': { host: openShiftAppsHost },
    '/stats/': { host: openShiftAppsHost },
    '/system/': { host: openShiftAppsHost },
    '/systemtype/': { host: openShiftAppsHost }
};
