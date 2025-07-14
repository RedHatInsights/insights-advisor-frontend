import React, { createContext } from 'react';
import PropTypes from 'prop-types';
import configureStore from 'redux-mock-store';
import { Provider } from 'react-redux';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { IntlProvider } from 'react-intl';
import { EnvironmentContext } from '../App';
import { BASE_URL } from '../AppConstants';

export const DEFAULT_TEST_ENVIRONMENT_CONTEXT = {
  isLoading: false,
  isExportEnabled: true,
  isDisableRecEnabled: true,
  isAllowedToViewRec: true,
  updateDocumentTitle: () => {},
  getUser: () => '',
  on: () => {},
  hideGlobalFilter: () => {},
  mapGlobalFilter: () => {},
  globalFilterScope: () => {},
  requestPdf: () => {},
  isProd: () => {},
  BASE_URI: document.baseURI,
  BASE_URL: '/api/insights/v1',
  UI_BASE: './insights',
  RULES_FETCH_URL: `${BASE_URL}/rule/`,
  STATS_SYSTEMS_FETCH_URL: `${BASE_URL}/stats/systems/`,
  STATS_REPORTS_FETCH_URL: `${BASE_URL}/stats/reports/`,
  STATS_OVERVIEW_FETCH_URL: `${BASE_URL}/stats/overview/`,
  SYSTEMS_FETCH_URL: `${BASE_URL}/system/`,
  EDGE_DEVICE_BASE_URL: '/api/edge/v1',
  INVENTORY_BASE_URL: '/api/inventory/v1',
  REMEDIATIONS_BASE_URL: '/api/remediations/v1',
};

export const ComponentWithContext = ({
  Component,
  componentProps,
  renderOptions = {},
  Context = createContext({}),
  contextValue = {},
}) => {
  const mockStore = configureStore();
  const mergedEnvContext = {
    ...DEFAULT_TEST_ENVIRONMENT_CONTEXT,
    ...contextValue,
  };

  return (
    <EnvironmentContext.Provider value={mergedEnvContext}>
      <IntlProvider locale="en">
        <Provider store={renderOptions?.store || mockStore()}>
          <MemoryRouter initialEntries={renderOptions?.initialEntries || ['/']}>
            <Context.Provider value={contextValue}>
              {renderOptions?.componentPath ? (
                <Routes>
                  <Route>
                    <Component {...componentProps} />
                  </Route>
                </Routes>
              ) : (
                <Component {...componentProps} />
              )}
            </Context.Provider>
          </MemoryRouter>
        </Provider>
      </IntlProvider>
    </EnvironmentContext.Provider>
  );
};

ComponentWithContext.propTypes = {
  Component: PropTypes.elementType,
  componentProps: PropTypes.object,
  renderOptions: PropTypes.object,
  Context: PropTypes.object,
  contextValue: PropTypes.object,
};
