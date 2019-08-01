import PropTypes from 'prop-types';
import React, { Component } from 'react';
import routerParams from '@redhat-cloud-services/frontend-components-utilities/files/RouterParams';
import { connect } from 'react-redux';
import { matchPath } from 'react-router-dom';

import { Routes } from './Routes';
import './App.scss';

class App extends Component {
    componentDidMount() {
        insights.chrome.init();
        insights.chrome.identifyApp('insights');
        this.appNav = insights.chrome.on('APP_NAVIGATION', event => {
            if (!matchPath(location.href, { path: `${document.baseURI}insights/${event.navId}` })) {
                this.props.history.push(`/${event.navId}`);
            }
        });
    }

    componentDidUpdate(prevProps) {
        if (this.props !== prevProps) {
            const baseComponentUrl = location.href.slice(location.href.indexOf('insights/')).split('/')[1];
            const appNavClick = {
                overview() { insights.chrome.appNavClick({ id: 'overview' });},
                rules() { insights.chrome.appNavClick({ id: 'rules' });}
            };
            appNavClick[baseComponentUrl]();
        }
    }

    componentWillUnmount() {
        this.appNav();
    }

    render() {
        return (
            <Routes childProps={this.props} />
        );
    }
}

App.propTypes = {
    location: PropTypes.object,
    history: PropTypes.object
};

export default routerParams(connect(
    null,
    null
)(App));
