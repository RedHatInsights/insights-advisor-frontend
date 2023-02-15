import React, { useEffect, useReducer } from 'react';
import { Redirect, Route } from 'react-router-dom';
import useChrome from '@redhat-cloud-services/frontend-components/useChrome';
import PropTypes from 'prop-types';

const reducer = (state, { type, payload }) =>
  ({ setLoaded: { ...state, loaded: true, isInternal: payload } }[type]);

const AdminProtectedRoute = ({ component: Component, ...props }) => {
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

AdminProtectedRoute.propTypes = { component: PropTypes.any };

export default AdminProtectedRoute;
