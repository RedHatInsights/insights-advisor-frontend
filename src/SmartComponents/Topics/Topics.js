import React, { useEffect, useState } from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';

import asyncComponent from '../../Utilities/asyncComponent';

const List = asyncComponent(() => import(/* webpackChunkName: "TopicsList" */ './List'));
const Details = asyncComponent(() => import(/* webpackChunkName: "TopicDetails" */ './Details'));
const Admin = asyncComponent(() => import(/* webpackChunkName: "TopicAdmin" */ '../../PresentationalComponents/TopicsAdminTable/TopicsAdminTable'));

const Topics = () => {
    const [isInternal, setIsInternal] = useState({});
    useEffect(() => { insights.chrome.auth.getUser().then((data) => setIsInternal(data.identity.internal)); }, []);

    return <React.Fragment>
        <Switch>
            {isInternal && <Route exact path='/topics/admin/manage' component={Admin} />}
            <Route exact path='/topics' component={List} />
            <Route exact path='/topics/:id' component={Details} />

            <Redirect path='*' to='/topics' push />
        </Switch>
    </React.Fragment>;
};

export default Topics;
