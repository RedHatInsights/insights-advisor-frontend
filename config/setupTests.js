import React from 'react';
global.React = React;
global.window = Object.create(window);
global.window.insights = {
  ...(window.insights || {}),
  chrome: {
    auth: {
      getUser: () =>
        new Promise((res) =>
          res({
            identity: {
              // eslint-disable-next-line camelcase
              account_number: '0',
              type: 'User',
            },
            entitlements: {
              insights: {
                // eslint-disable-next-line camelcase
                is_entitled: true,
              },
            },
          })
        ),
    },
    isBeta: jest.fn(),
    getUserPermissions: () =>
      new Promise((res) =>
        res([
          {
            permission: 'advisor:*:*',
            resourceDefinitions: [],
          },
        ])
      ),
  },
};

global.window.__scalprum__ = {
  scalprumOptions: {
    cacheTimeout: 999999,
  },
  appsConfig: {
    inventory: {
      manifestLocation:
        'https://console.stage.redhat.com/apps/inventory/fed-mods.json?ts=1643875037626',
      module: 'inventory#./RootApp',
      name: 'inventory',
    },
  },
  factories: {
    inventory: {
      expiration: new Date('01-01-3000'),
      modules: {
        './InventoryTable': {
          __esModule: true,
          default: function returnMock() {
            return (
              <div>
                <h1>Inventory mock</h1>
              </div>
            );
          },
        },
      },
    },
  },
};
