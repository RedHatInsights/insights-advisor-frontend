import React from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';
import routerParams from '@redhat-cloud-services/frontend-components-utilities/files/RouterParams';
import asyncComponent from '../../Utilities/asyncComponent';

const OverviewDashboard = asyncComponent(() => import(/* webpackChunkName: "Overview" */ './Dashboard'));

const Overview = () => {
    return (
        <Switch>
            <Route exact path='/overview' component={ OverviewDashboard } />
            <Redirect path='*' to='/overview'  push/>
        </Switch>
    );
};

export default routerParams(Overview);
