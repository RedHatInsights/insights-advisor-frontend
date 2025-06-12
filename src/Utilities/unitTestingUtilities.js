/* eslint-disable react/prop-types */
import { useSelector } from 'react-redux';
import React from 'react';
import configureStore from 'redux-mock-store';
/* eslint-disable-next-line */
import { IntlProvider } from '@redhat-cloud-services/frontend-components-translations';

export const initMocks = () => {
  window.insights = {
    chrome: {
      appNavClick: () => {},
      init: jest.fn(),
      navigation: () => {},
      on: () => {
        return () => {};
      },
      isBeta: () => true,
      auth: {
        getUser: () =>
          new Promise((resolve) =>
            resolve({
              identity: {
                user: {},
              },
            }),
          ),
      },
      getUserPermissions: () => Promise.resolve([]),
    },
    loadInventory: () =>
      new Promise((resolve) => {
        resolve({
          inventoryConnector: () => {
            const InventoryTable = ({ children }) => (
              <div>A mock passed! {children} </div>
            );
            const InventoryDetailHead = ({ children }) => (
              <div>A mock passed! {children} </div>
            );
            const AppInfo = ({ children }) => (
              <div>A mock passed! {children} </div>
            );
            const DetailWrapper = ({ children }) => (
              <div>A mock passed! {children} </div>
            );

            return {
              InventoryTable,
              InventoryDetailHead,
              AppInfo,
              DetailWrapper,
            };
          },
          mergeWithEntities: () => {},
          mergeWithDetail: () => {},
        });
      }),
    loadRemediations: () =>
      new Promise((resolve) => {
        resolve({
          openWizard: () =>
            new Promise((resolve) => {
              resolve(true);
            }),
        });
      }),
  };
};

export const mockStore = (initialState, mutatedState) => {
  const customMiddleWare = () => (next) => (action) => {
    useSelector.mockImplementation((callback) => {
      return callback(mutatedState);
    });
    next(action);
  };

  const configuredMockStore = configureStore([customMiddleWare]);

  return configuredMockStore(initialState);
};
