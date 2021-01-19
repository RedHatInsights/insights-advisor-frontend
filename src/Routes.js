import { Redirect, Route, Switch } from 'react-router-dom';

import PropTypes from 'prop-types';
import React, { lazy, Suspense } from 'react';
import { Bullseye, Spinner } from '@patternfly/react-core';

const Recs = lazy(() => import(/* webpackChunkName: "Recs" */ './SmartComponents/Recs/Recs'));
const Systems = lazy(() => import(/* webpackChunkName: "Systems" */ './SmartComponents/Systems/Systems'));
const Topics = lazy(() => import(/* webpackChunkName: "Topics" */ './SmartComponents/Topics/Topics'));

const paths = [
    { title: 'Recommendations', path: '/recommendations:?', rootClass: 'Insights', component: Recs },
    { title: 'Recommendations', path: '/recommendations', rootClass: 'Insights', component: Recs },
    { title: 'Systems', path: '/systems:?', rootClass: 'Insights', component: Systems },
    { title: 'Systems', path: '/systems', rootClass: 'Insights', component: Systems },
    { title: 'Topics', path: '/topics', rootClass: 'Insights', component: Topics }
];

const InsightsRoute = ({ component: Component, rootClass, ...rest }) => {
    const root = document.getElementById('root');
    /**
     * @deprecated
     * mutating chrome layout should not be used in chrome 2 apps.
     * I can cause issues in other applications. Use custom layout directly in application.
     */
    if (root) {
        root.removeAttribute('class');
        root.classList.add(`page__${rootClass}`, 'pf-c-page__main', 'advisor');
        root.setAttribute('role', 'main');
    }

    return (<Route {...rest} component={Component} />);
};

InsightsRoute.propTypes = {
    component: PropTypes.func,
    rootClass: PropTypes.string
};

export const Routes = () => (
    <Suspense fallback={<Bullseye><Spinner size="xl" /></Bullseye>}>
        <Switch>
            {paths.map((path) => <InsightsRoute key={path.title} path={path.path} component={path.component} rootClass={path.rootClass} />)}
            <Redirect path='/recommendations' to={`${paths[1].path}`} push />
            { /* Finally, catch all unmatched routes */}
            <Redirect path='*' to={`${paths[1].path}`} push />
        </Switch>
    </Suspense>
);
