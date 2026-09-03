/* eslint-disable no-undef */
/**
 * Foreman/IOP hosts provide react in the module federation shared scope but not
 * react/jsx-runtime or react-intl. FEC defaults mark these as chromeProvided with
 * import: false, so the remote fails with:
 *   Shared module react/jsx-runtime doesn't exist in shared scope default
 *   (0 , react_intl__WEBPACK_IMPORTED_MODULE_0__.createIntlCache) is not a function
 *
 * Remove these from chromeProvided so webpack bundles them in the remote.
 */
const federatedModulesPath = require.resolve(
    '@redhat-cloud-services/frontend-components-config-utilities/federated-modules'
);
const federatedModulesUtil = require(federatedModulesPath);
const originalCreateIncludes = federatedModulesUtil.createIncludes;

federatedModulesUtil.createIncludes = (...args) => {
    const includes = originalCreateIncludes(...args);
    delete includes.chromeProvided['react/jsx-runtime'];
    delete includes.chromeProvided['react-intl'];
    return includes;
};
