import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router } from 'react-router-dom';
import { Provider } from 'react-redux';
import { init } from './Store';
import App from './App';
import logger from 'redux-logger';
import { NotificationsPortal } from '@red-hat-insights/insights-frontend-components/components/Notifications';

const pathName = window.location.pathname.split('/');
pathName.shift();

let release = '/';
if (pathName[0] === 'beta') {
    release = `/${pathName.shift()}/`;
}

ReactDOM.render(
    <Provider store={ init(logger).getStore() }>
        <Router basename={ `${release}${pathName[0]}` }>
            <React.Fragment>
                <NotificationsPortal/>
                <App/>
            </React.Fragment>
        </Router>
    </Provider>,
    document.getElementById('root')
);
