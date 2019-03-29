import React from 'react';
import { Route, Switch } from 'react-router-dom';
import { routerParams } from '@red-hat-insights/insights-frontend-components';
import asyncComponent from '../../Utilities/asyncComponent';

const ActionsOverview = asyncComponent(() => import(/* webpackChunkName: "ActionsOverview" */ './ActionsOverview'));
const ViewActions = asyncComponent(() => import(/* webpackChunkName: "ListActions" */ './ViewActions'));
const ListActions = asyncComponent(() => import(/* webpackChunkName: "ListActions" */ './ListActions'));
const InventoryDetails = asyncComponent(() =>
    import(/* webpackChunkName: "InventoryDetails" */ '../../PresentationalComponents/Inventory/InventoryDetails'));

const Actions = () => {
    return (
        <Switch>
            <Route exact path='/actions' component={ ActionsOverview } />
            <Route exact path='/actions/:type' component={ ListActions }/>
            <Route exact path='/actions/by_id/:id' component={ ViewActions }/>
            <Route exact path='/actions/:type/:id' component={ ViewActions }/>
            <Route path='/actions/by_id/:id/:inventoryId/' component={ InventoryDetails }/>
            <Route path='/actions/:type/:id/:inventoryId/' component={ InventoryDetails }/>
        </Switch>
    );
};

export default routerParams(Actions);
