import React from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';
import asyncComponent from '../../Utilities/asyncComponent';

const InsightsTabs = asyncComponent(() => import(/* webpackChunkName: "InsightsTabs" */ '../InsightsTabs/InsightsTabs'));
const Details = asyncComponent(() => import(/* webpackChunkName: "Details" */ './Details'));
const InventoryDetails = asyncComponent(() =>
    import(/* webpackChunkName: "InventoryDetails" */ '../../PresentationalComponents/Inventory/InventoryDetails'));

const Rules = () => <React.Fragment>
    <Switch>
        <Route exact path='/rules' component={InsightsTabs} />
        <Route exact path='/rules/systems' component={InsightsTabs} />
        <Route exact path='/rules/systems/:inventoryId/' component={InventoryDetails} />
        <Route exact path='/rules/by_id/:id' component={Details} />
        <Route exact path='/rules/:id' component={Details} />
        <Route path='/rules/by_id/:id/:inventoryId/' component={InventoryDetails} />
        <Route path='/rules/:id/:inventoryId/' component={InventoryDetails} />
        <Redirect path='*' to='/rules' push />
    </Switch>
</React.Fragment>;

export default Rules;
