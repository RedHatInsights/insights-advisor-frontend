import PropTypes from 'prop-types';
import React from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { Routes } from './Routes';
import './App.scss';
import * as AppActions from './AppActions';

class App extends React.Component {

    componentDidMount () {
        insights.chrome.init();
        insights.chrome.identifyApp('advisor');
        insights.chrome.navigation(buildNavigation());

        this.appNav = insights.chrome.on('APP_NAVIGATION', event => this.props.history.push(`/${event.navId}`));
        this.buildNav = this.props.history.listen(() => insights.chrome.navigation(buildNavigation()));

        this.props.fetchImpactedSystems();
        this.props.fetchMediumRiskRules();
    }

    componentWillUnmount () {
        this.appNav();
        this.buildNav();
    }

    render () {
        return (
            <Routes childProps={this.props} />
        );
    }
}

App.propTypes = {
    history: PropTypes.object,
    fetchImpactedSystems: PropTypes.func,
    fetchMediumRiskRules: PropTypes.func
};

const mapDispatchToProps = dispatch => ({
    fetchImpactedSystems: () => dispatch(AppActions.fetchImpactedSystems()),
    fetchMediumRiskRules: () => dispatch(AppActions.fetchMediumRiskRules())
});

export default withRouter(connect(
    null,
    mapDispatchToProps
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
