import { Redirect, Route, Switch } from 'react-router-dom';

import React from 'react';
import asyncComponent from '../../Utilities/asyncComponent';

const InsightsTabs = asyncComponent(() => import(/* webpackChunkName: "InsightsTabs" */ '../InsightsTabs/InsightsTabs'));
const Details = asyncComponent(() => import(/* webpackChunkName: "Details" */ './Details'));
const InventoryDetails = asyncComponent(() =>
    import(/* webpackChunkName: "InventoryDetails" */ '../../PresentationalComponents/Inventory/InventoryDetails'));

const Rules = () => <React.Fragment>
    <Switch>
        <Route exact path='/recommendations' component={InsightsTabs} />
        <Route exact path='/recommendations/systems' component={InsightsTabs} />
        <Route exact path='/recommendations/systems/:inventoryId/' component={InventoryDetails} />
        <Route exact path='/recommendations/by_id/:id' component={Details} />
        <Route exact path='/recommendations/:id' component={Details} />
        <Route path='/recommendations/by_id/:id/:inventoryId/' component={InventoryDetails} />
        <Route path='/recommendations/:id/:inventoryId/' component={InventoryDetails} />
        <Redirect path='*' to='/recommendations' push />
    </Switch>
</React.Fragment>;

export default Rules;
