import { Redirect, Route, Switch } from 'react-router-dom';

import React from 'react';
import asyncComponent from '../../Utilities/asyncComponent';

const List = asyncComponent(() => import(/* webpackChunkName: "List" */ './List'));
const Details = asyncComponent(() =>
    import(/* webpackChunkName: "InventoryDetails" */ '../../PresentationalComponents/Inventory/InventoryDetails'));

const Systems = () => <React.Fragment>
    <Switch>
        <Route exact path='/systems' component={List} />
        <Route exact path='/systems/:inventoryId/' component={Details} />
        <Redirect path='*' to='/systems' push />
    </Switch>
</React.Fragment>;

export default Systems;
