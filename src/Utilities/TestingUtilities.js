import React from 'react';
import { render } from '@testing-library/react';
import configureStore from 'redux-mock-store';
import { Provider } from 'react-redux';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { IntlProvider } from 'react-intl';

const mockStore = configureStore();

export const renderWithContext = (
  Component,
  componentProps,
  renderOptions = {}
) => {
  const { container, unmount, rerender } = render(
    <IntlProvider locale="en">
      <Provider store={renderOptions?.store || mockStore()}>
        <MemoryRouter initialEntries={renderOptions?.initialEntries || ['/']}>
          {renderOptions?.componentPath ? (
            <Routes>
              <Route>
                <Component {...componentProps} />
              </Route>
            </Routes>
          ) : (
            <Component {...componentProps} />
          )}
        </MemoryRouter>
      </Provider>
    </IntlProvider>
  );

  return { container, unmount, rerender };
};
