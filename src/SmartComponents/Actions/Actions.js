import React from 'react';
import { withRouter, Route, Switch } from 'react-router-dom';
import asyncComponent from '../../Utilities/asyncComponent';

const ActionsOverview = asyncComponent(() => import(/* webpackChunkName: "ActionsOverview" */ './ActionsOverview'));
const ViewActions = asyncComponent(() => import(/* webpackChunkName: "ListActions" */ './ViewActions'));
const ListActions = asyncComponent(() => import(/* webpackChunkName: "ListActions" */ './ListActions'));

const Actions = () => {
    return (
        <Switch>
            <Route exact path='/actions' component={ ActionsOverview } />
            <Route exact path='/actions/:type' component={ ViewActions }/>
            <Route exact path='/actions/:type/:id' component={ ListActions }/>
        </Switch>
    );
};

export default withRouter(Actions);
