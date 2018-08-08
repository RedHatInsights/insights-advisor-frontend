import React from 'react';
import { withRouter, Route, Switch } from 'react-router-dom';
import asyncComponent from '../../Utilities/asyncComponent';

import { PageHeader, PageHeaderTitle } from '@red-hat-insights/insights-frontend-components';

const ActionsOverview = asyncComponent(() => import(/* webpackChunkName: "ActionsOverview" */ './ActionsOverview'));
const ViewActions = asyncComponent(() => import(/* webpackChunkName: "ListActions" */ './ViewActions'));
const ListActions = asyncComponent(() => import(/* webpackChunkName: "ListActions" */ './ListActions'));

const Actions = () => {
    return (
        <React.Fragment>
            <PageHeader>
                <PageHeaderTitle title='Actions'/>
            </PageHeader>
            <Switch>
                <Route exact path='/actions' component={ActionsOverview} />
                <Route path='/actions/:type' component={ViewActions}/>
                <Route path='/actions/:type/:id' component={ListActions}/>
            </Switch>
        </React.Fragment>
    );
};

export default withRouter(Actions);
