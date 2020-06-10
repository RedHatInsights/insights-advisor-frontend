import { Redirect, Route, Switch } from 'react-router-dom';

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
const Recs = asyncComponent(() => import(/* webpackChunkName: "Recs" */ './SmartComponents/Recs/Recs'));
const Systems = asyncComponent(() => import(/* webpackChunkName: "Systems" */ './SmartComponents/Systems/Systems'));
const Topics = asyncComponent(() => import(/* webpackChunkName: "Topics" */ './SmartComponents/Topics/Topics'));

const paths = [
    { title: 'Recommendations', path: '/recommendations:?', rootClass: 'Insights', component: Recs },
    { title: 'Recommendations', path: '/recommendations', rootClass: 'Insights', component: Recs },
    { title: 'Systems', path: '/systems:?', rootClass: 'Insights', component: Systems },
    { title: 'Systems', path: '/systems', rootClass: 'Insights', component: Systems },
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

export const Routes = () => <Switch>
    {paths.map((path) => <InsightsRoute key={path.title} path={path.path} component={path.component} rootClass={path.rootClass} />)}
    <Redirect path='/recommendations' to={`${paths[1].path}`} push />
    { /* Finally, catch all unmatched routes */}
    <Redirect path='*' to={`${paths[1].path}`} push />
</Switch>;
