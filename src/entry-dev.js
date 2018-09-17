import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router } from 'react-router-dom';
import { Provider } from 'react-redux';
import { init } from './store';
import App from './App';
import logger from 'redux-logger';

ReactDOM.render(
    <Provider store={ init(logger).getStore() }>
        <Router basename='/insights/platform/advisor'>
            <App />
        </Router>
    </Provider>,
    document.getElementById('root')
);
