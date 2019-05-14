import React from 'react';

import { PageHeader, PageHeaderTitle } from '@redhat-cloud-services/frontend-components';
import { Route, Switch } from 'react-router-dom';
import asyncComponent from '../../Utilities/asyncComponent';

const ListRules = asyncComponent(() => import(/* webpackChunkName: "ListRules" */ './ListRules'));

const Rules = () => {
    return (
        <React.Fragment>
            <PageHeader>
                <PageHeaderTitle title='Rules'/>
            </PageHeader>
            <Switch>
                <Route exact path='/rules' component={ ListRules } />
            </Switch>
        </React.Fragment>
    );
};

export default Rules;
