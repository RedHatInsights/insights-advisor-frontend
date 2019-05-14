import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router } from 'react-router-dom';
import { Provider } from 'react-redux';
import { init } from './Store';
import App from './App';
import logger from 'redux-logger';
import getBaseName from './Utilities/getBaseName';
import { NotificationsPortal } from '@redhat-cloud-services/frontend-components-notifications';

ReactDOM.render(
    <Provider store={ init(logger).getStore() }>
        <Router basename={ getBaseName(window.location.pathname) }>
            <React.Fragment>
                <NotificationsPortal/>
                <App/>
            </React.Fragment>
        </Router>
    </Provider>,

    document.getElementById('root')
);
