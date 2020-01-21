import React, { useEffect, useReducer } from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';

import PropTypes from 'prop-types';
import asyncComponent from '../../Utilities/asyncComponent';

const List = asyncComponent(() => import(/* webpackChunkName: "TopicsList" */ './List'));
const Details = asyncComponent(() => import(/* webpackChunkName: "TopicDetails" */ './Details'));
const Admin = asyncComponent(() => import(/* webpackChunkName: "TopicAdmin" */ '../../PresentationalComponents/TopicsAdminTable/TopicsAdminTable'));

const reducer = (state, { type, payload }) => ({ setLoaded: { ...state, loaded: true, isInternal: payload } }[type]);

const ProtectedRoute = ({ component: Component, ...props }) => {
    const [state, dispatch] = useReducer(reducer, { isInternal: false, loaded: false });

    useEffect(() => { insights.chrome.auth.getUser().then((data) => dispatch({ type: 'setLoaded', payload: data.identity.user.is_internal })); }, []);

    return <Route {...props} render={props => state.loaded && (state.isInternal ? <Component {...props} /> : <Redirect to='/topics' />)} />;
};

const Topics = () => <Switch>
    <Route exact path='/topics' component={List} />
    <Route exact path='/topics/:id' component={Details} />
    <ProtectedRoute exact path='/topics/admin/manage' component={Admin} />

    <Redirect path='*' to='/topics' push />
</Switch>;

ProtectedRoute.propTypes = { component: PropTypes.any };

export default Topics;
