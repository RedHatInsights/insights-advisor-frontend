// Mock for @scalprum/core to prevent initialization errors in Cypress tests

const mockScalprum = {
  appsConfig: {},
  api: {},
  exposedModules: {},
  existingScopes: {},
  pendingInjections: {},
  scalprumOptions: {},
  pluginStore: {
    getExposedModule: (scope, module) => {
      // Use the factories from window.__scalprum__ if available
      if (
        typeof window !== 'undefined' &&
        window.__scalprum__?.factories?.[scope]?.modules?.[module]
      ) {
        return Promise.resolve(
          window.__scalprum__.factories[scope].modules[module],
        );
      }
      return Promise.resolve({ default: () => 'Remediations' });
    },
    setFeatureFlags: () => {},
  },
};

module.exports = {
  GLOBAL_NAMESPACE: '__scalprum__',
  getScalprum: () => mockScalprum,
  initialize: () => mockScalprum,
  getModuleIdentifier: (scope, module) => `${scope}#${module}`,
  getSharedScope: () => ({}),
  initSharedScope: () => Promise.resolve(),
  handlePrefetchPromise: () => {},
  getCachedModule: (scope, module) => {
    // Return the mock from window.__scalprum__.factories
    if (
      typeof window !== 'undefined' &&
      window.__scalprum__?.factories?.[scope]?.modules?.[module]
    ) {
      return {
        cachedModule: window.__scalprum__.factories[scope].modules[module],
      };
    }
    return {};
  },
  setPendingPrefetch: () => {},
  getPendingPrefetch: () => undefined,
  removePrefetch: () => {},
  resolvePendingInjection: () => {},
  setPendingLoading: () => {},
  getPendingLoading: () => undefined,
  preloadModule: () => Promise.resolve({}),
  getModule: (scope, module) => {
    // Return the mock from window.__scalprum__.factories
    if (
      typeof window !== 'undefined' &&
      window.__scalprum__?.factories?.[scope]?.modules?.[module]
    ) {
      return Promise.resolve({
        cachedModule: window.__scalprum__.factories[scope].modules[module],
      });
    }
    return Promise.resolve({});
  },
  removeScalprum: () => {},
  getAppData: () => ({}),
  processManifest: () => Promise.resolve(),
};
