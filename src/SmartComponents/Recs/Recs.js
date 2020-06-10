import { Redirect, Route, Switch } from 'react-router-dom';

import React from 'react';
import asyncComponent from '../../Utilities/asyncComponent';

const List = asyncComponent(() => import(/* webpackChunkName: "List" */ './List'));
const Details = asyncComponent(() => import(/* webpackChunkName: "Details" */ './Details'));
const InventoryDetails = asyncComponent(() =>
    import(/* webpackChunkName: "InventoryDetails" */ '../../PresentationalComponents/Inventory/InventoryDetails'));

const Recs = () => <React.Fragment>
    <Switch>
        <Route exact path='/recommendations' component={List} />
        <Route exact path='/recommendations/by_id/:id' component={List} />
        <Route exact path='/recommendations/:id' component={Details} />
        <Route path='/recommendations/by_id/:id/:inventoryId/' component={InventoryDetails} />
        <Route path='/recommendations/:id/:inventoryId/' component={InventoryDetails} />
        <Redirect path='*' to='/recommendations' push />
    </Switch>
</React.Fragment>;

export default Recs;
