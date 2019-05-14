import React from 'react';
import { Route, Switch } from 'react-router-dom';
import routerParams from '@redhat-cloud-services/frontend-components-utilities/files/RouterParams';
import asyncComponent from '../../Utilities/asyncComponent';

const OverviewDashboard = asyncComponent(() => import(/* webpackChunkName: "Overview" */ './Dashboard'));
const Details = asyncComponent(() => import(/* webpackChunkName: "Details" */ './Details'));
const List = asyncComponent(() => import(/* webpackChunkName: "Lists" */ './List'));
const InventoryDetails = asyncComponent(() =>
    import(/* webpackChunkName: "InventoryDetails" */ '../../PresentationalComponents/Inventory/InventoryDetails'));

const Overview = () => {
    return (
        <Switch>
            <Route exact path='/overview' component={ OverviewDashboard } />
            <Route exact path='/overview/:type' component={ List }/>
            <Route exact path='/overview/by_id/:id' component={ Details }/>
            <Route exact path='/overview/:type/:id' component={ Details }/>
            <Route path='/overview/by_id/:id/:inventoryId/' component={ InventoryDetails }/>
            <Route path='/overview/:type/:id/:inventoryId/' component={ InventoryDetails }/>
        </Switch>
    );
};

export default routerParams(Overview);
