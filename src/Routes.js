import { Route, Switch, useLocation } from 'react-router-dom';

import PropTypes from 'prop-types';
import React from 'react';
import asyncComponent from './Utilities/asyncComponent';

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
const Rules = asyncComponent(() => import(/* webpackChunkName: "Rules" */ './SmartComponents/Rules/Rules'));
const Topics = asyncComponent(() => import(/* webpackChunkName: "Topics" */ './SmartComponents/Topics/Topics'));
const paths = [
    { title: 'Rules', path: '/recommendations:?', rootClass: 'Insights', component: Rules },
    { title: 'Rules', path: '/recommendations', rootClass: 'Insights', component: Rules },
    { title: 'Systems', path: '/systems:?', rootClass: 'Insights', component: Rules },
    { title: 'Systems', path: '/systems', rootClass: 'Insights', component: Rules },
    { title: 'Topics', path: '/topics', rootClass: 'Insights', component: Topics }
];

const InsightsRoute = ({ component: Component, rootClass, ...rest }) => {
    const root = document.getElementById('root');
    root.removeAttribute('class');
    root.classList.add(`page__${rootClass}`, 'pf-c-page__main');
    root.setAttribute('role', 'main');

    return (<Route {...rest} component={Component} />);
};

InsightsRoute.propTypes = {
    component: PropTypes.func,
    rootClass: PropTypes.string
};

/**
 * the Switch component changes routes depending on the path.
 *
 * Route properties:
 *      exact - path must match exactly,
 *      path - https://prod.foo.redhat.com:1337/insights/advisor/rules
 *      component - component to be rendered when a route has been chosen.
 */
export const Routes = () =>{

    // eslint-disable-next-line no-console
    console.error(location, useLocation());
    return <Switch>
        {paths.map((path) => <InsightsRoute key={path.title} path={path.path} component={path.component} rootClass={path.rootClass} />)}
        { /* Finally, catch all unmatched routes */}
        {/* <Redirect path='*' to={`${paths[0].path}`} push /> */}
    </Switch>;};
