import { matchPath, Route, Switch } from 'react-router-dom';
import PropTypes from 'prop-types';
import React from 'react';
import asyncComponent from './Utilities/asyncComponent';
import some from 'lodash/some';

/**
 * Aysnc imports of components
 *
 * https://webpack.js.org/guides/code-splitting/
 * https://reactjs.org/docs/code-splitting.html
 *
 * pros:
 *      1) code splitting
 *      2) can be used in server-side rendering
 * cons:
 *      1) nameing chunk names adds unnecessary docs to code,
 *         see the difference with DashboardMap and InventoryDeployments.
 *
 */
const Actions = asyncComponent(() => import(/* webpackChunkName: "Actions" */ './SmartComponents/Actions/Actions'));
const Rules = asyncComponent(() => import(/* webpackChunkName: "Rules" */ './SmartComponents/Rules/Rules'));
const paths = {
    actions: '/actions',
    rules: '/rules'
};

const InsightsRoute = ({ component: Component, rootClass, ...rest }) => {
    const root = document.getElementById('root');
    root.removeAttribute('class');
    root.classList.add(`page__${rootClass}`, 'pf-c-page__main');
    root.setAttribute('role', 'main');

    return <Route { ...rest } component={ Component }/>;
};

InsightsRoute.propTypes = {
    component: PropTypes.func,
    rootClass: PropTypes.string
};

function checkPaths (routes, app) {
    return some(Object
    .values(routes), route => matchPath(location.href, { path: `${document.baseURI}${app}${route}` }));
}

/**
 * the Switch component changes routes depending on the path.
 *
 * Route properties:
 *      exact - path must match exactly,
 *      path - https://prod.foo.redhat.com:1337/insights/advisor/rules
 *      component - component to be rendered when a route has been chosen.
 */
export const Routes = ({ childProps: { history }}) => {
    const pathName = window.location.pathname.split('/');
    pathName.shift();

    if (pathName[0] === 'beta') {
        pathName.shift();
    }

    if (!checkPaths(paths, pathName[0])) {
        history.push(paths.actions);
    }

    return (
        <Switch>
            <InsightsRoute path={ paths.actions } component={ Actions } rootClass='actions'/>
            <InsightsRoute path={ paths.rules } component={ Rules } rootClass='rules'/>
        </Switch>
    );
};

Routes.propTypes = {
    childProps: PropTypes.shape({
        history: PropTypes.shape({
            push: PropTypes.func
        })
    })
};
