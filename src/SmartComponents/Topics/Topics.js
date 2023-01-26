import React, { Suspense, lazy, useEffect, useReducer } from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';
import useChrome from '@redhat-cloud-services/frontend-components/useChrome';

import Loading from '../../PresentationalComponents/Loading/Loading';
import PropTypes from 'prop-types';

const List = lazy(() => import(/* webpackChunkName: "TopicsList" */ './List'));
const Details = lazy(() =>
  import(/* webpackChunkName: "TopicDetails" */ './Details')
);
const Admin = lazy(() =>
  import(
    /* webpackChunkName: "TopicAdmin" */ '../../PresentationalComponents/TopicsAdminTable/TopicsAdminTable'
  )
);

const reducer = (state, { type, payload }) =>
  ({ setLoaded: { ...state, loaded: true, isInternal: payload } }[type]);

const ProtectedRoute = ({ component: Component, ...props }) => {
  const [state, dispatch] = useReducer(reducer, {
    isInternal: false,
    loaded: false,
  });
  const chrome = useChrome();

  useEffect(() => {
    chrome.auth
      .getUser()
      .then((data) =>
        dispatch({ type: 'setLoaded', payload: data.identity.user.is_internal })
      );
  }, []);

  return (
    <Route
      {...props}
      render={(props) =>
        state.loaded &&
        (state.isInternal ? (
          <Component {...props} />
        ) : (
          <Redirect to="/topics" />
        ))
      }
    />
  );
};

const suspenseHelper = (component) => (
  <Suspense fallback={<Loading />}>{component}</Suspense>
);

const Topics = () => (
  <Switch>
    <Route exact path="/topics" component={() => suspenseHelper(<List />)} />
    <Route
      exact
      path="/topics/:id"
      component={() => suspenseHelper(<Details />)}
    />
    <ProtectedRoute
      exact
      path="/topics/admin/manage"
      component={() => suspenseHelper(<Admin />)}
    />

    <Redirect path="*" to="/topics" push />
  </Switch>
);

ProtectedRoute.propTypes = { component: PropTypes.any };

export default Topics;
