/* global exports */
const openShiftAppsHost = `https://access.redhat.com/r/insights/platform/advisor/v1`;

exports.routes = {
    '/rule/': { host: openShiftAppsHost },
    '/stats/': { host: openShiftAppsHost },
    '/system/': { host: openShiftAppsHost },
    '/systemtype/': { host: openShiftAppsHost }
};
