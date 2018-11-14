import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router } from 'react-router-dom';
import { Provider } from 'react-redux';
import { init } from './Store';
import App from './App';
import logger from 'redux-logger';
import { NotificationsPortal } from '@red-hat-insights/insights-frontend-components/components/Notifications';

// exposes webpack variable RELEASE
/*global RELEASE:true*/

ReactDOM.render(
    <Provider store={ init(logger).getStore() }>
        <Router basename={ `/${RELEASE}/platform/advisor` }>
            <React.Fragment>
                <NotificationsPortal />
                <App />
            </React.Fragment>
        </Router>
    </Provider>,
    document.getElementById('root')
);
