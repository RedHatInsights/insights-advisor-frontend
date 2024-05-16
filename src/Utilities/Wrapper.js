import React from 'react';
import PropTypes from 'prop-types';
import { Provider } from 'react-redux';
import { IntlProvider } from 'react-intl';
import { MemoryRouter } from 'react-router-dom';

import messages from '../../locales/translations.json';
import { store } from '../Store';

const Wrapper = ({ children }) => (
  <IntlProvider messages={messages} defaultLocale="en" locale="en">
    <Provider store={store}>
      <MemoryRouter>{children}</MemoryRouter>
    </Provider>
  </IntlProvider>
);

Wrapper.propTypes = {
  children: PropTypes.any,
};

export default Wrapper;
