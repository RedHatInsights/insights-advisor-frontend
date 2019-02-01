import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { routerParams } from '@red-hat-insights/insights-frontend-components';
import { matchPath } from 'react-router-dom';
import { connect } from 'react-redux';
import { Routes } from './Routes';
import './App.scss';

class App extends Component {
    componentDidMount () {
        insights.chrome.init();
        insights.chrome.identifyApp('advisor');
        insights.chrome.navigation(buildNavigation());
        this.appNav = insights.chrome.on('APP_NAVIGATION', event => {
            if (!matchPath(location.href, { path: `${document.baseURI}platform/advisor/${event.navId}` })) {
                this.props.history.push(`/${event.navId}`);
            }
        });
        this.buildNav = this.props.history.listen(() => insights.chrome.navigation(buildNavigation()));
    }

    componentWillUnmount () {
        this.appNav();
        this.buildNav();
    }

    render () {
        return (
            <Routes childProps={ this.props }/>
        );
    }
}

App.propTypes = {
    history: PropTypes.object
};

export default routerParams(connect(
    null,
    null
)(App));

function buildNavigation () {
    const currentPath = window.location.pathname.split('/').slice(-1)[0];
    return [{
        title: 'Actions',
        id: 'actions'
    }, {
        title: 'Rules',
        id: 'rules'
    }].map(item => ({
        ...item,
        active: item.id === currentPath
    }));
}
