import React from 'react';

import { PageHeader } from '@red-hat-insights/insights-frontend-components';
import { PageHeaderTitle } from '@red-hat-insights/insights-frontend-components';
import { Route, Switch } from 'react-router-dom';
import asyncComponent from '../../Utilities/asyncComponent';

const ListRules = asyncComponent(() => import(/* webpackChunkName: "ListRules" */ './ListRules'));
const ViewRule = asyncComponent(() => import(/* webpackChunkName: "ListRules" */ './ViewRule'));

const Rules = () => {
    return (
        <React.Fragment>
            <PageHeader>
                <PageHeaderTitle title='Rules'/>
            </PageHeader>
            <Switch>
                <Route exact path='/advisor/rules' component={ListRules} />
                <Route path='/advisor/rules/:id' component={ViewRule} />
            </Switch>
        </React.Fragment>
    );
};

export default Rules;
