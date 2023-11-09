import React from 'react';

jest.mock('@redhat-cloud-services/frontend-components/useChrome', () => ({
  __esModule: true,
  default: () => ({
    updateDocumentTitle: jest.fn(),
    auth: {
      getUser: () =>
        Promise.resolve({
          identity: {
            account_number: '0',
            type: 'User',
            user: {
              is_org_admin: true,
            },
          },
          entitlements: {
            hybrid_cloud: { is_entitled: true },
            insights: { is_entitled: true },
            openshift: { is_entitled: true },
            smart_management: { is_entitled: false },
          },
        }),
    },
    appAction: jest.fn(),
    appObjectId: jest.fn(),
    on: jest.fn(),
    getUserPermissions: () => Promise.resolve(['inventory:*:*']),
    getApp: jest.fn(),
    getBundle: jest.fn(),
  }),
}));

jest.mock('@redhat-cloud-services/frontend-components/AsyncComponent', () => ({
  __esModule: true,
  default: (props) => (
    <div {...props} aria-label="immutableDevices-module-mock">
      AsyncComponent
    </div>
  ),
}));

global.insights = {
  chrome: {
    auth: {
      getUser: () =>
        Promise.resolve({
          identity: {
            account_number: '0',
            type: 'User',
            user: {
              is_org_admin: true,
            },
          },
          entitlements: {
            hybrid_cloud: { is_entitled: true },
            insights: { is_entitled: true },
            openshift: { is_entitled: true },
            smart_management: { is_entitled: false },
          },
        }),
    },
    appAction: jest.fn(),
    appObjectId: jest.fn(),
    on: jest.fn(),
    getUserPermissions: () => Promise.resolve(['inventory:*:*']),
    getApp: jest.fn(),
  },
};

global.window.__scalprum__ = {
  scalprumOptions: {
    cacheTimeout: 999999,
  },
  appsConfig: {
    inventory: {},
    remediations: {},
  },
  factories: {
    inventory: {},
    remediations: {},
  },
};
