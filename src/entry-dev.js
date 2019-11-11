/* eslint-disable no-console */
import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router } from 'react-router-dom';
import { Provider } from 'react-redux';
import { init } from './Store';
import App from './App';
import logger from 'redux-logger';
import getBaseName from './Utilities/getBaseName';
import { NotificationsPortal } from '@redhat-cloud-services/frontend-components-notifications';
import { IntlProvider } from '@redhat-cloud-services/frontend-components-translations';
import messages from '../locales/data.json';

ReactDOM.render(
    <IntlProvider locale={navigator.language} messages={messages} onError={console.log}>
        <Provider store={init(logger).getStore()}>
            <Router basename={getBaseName(window.location.pathname)}>
                <React.Fragment>
                    <NotificationsPortal />
                    <App />
                </React.Fragment>
            </Router>
        </Provider>
    </IntlProvider>,

    document.getElementById('root')
);
