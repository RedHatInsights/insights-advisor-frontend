import React, { Suspense, useState, useEffect, createContext } from 'react';
import { Bullseye, Spinner } from '@patternfly/react-core';
import AsynComponent from '@redhat-cloud-services/frontend-components/AsyncComponent';
import ErrorState from '@redhat-cloud-services/frontend-components/ErrorState';
import PropTypes from 'prop-types';
import { addNotification } from '@redhat-cloud-services/frontend-components-notifications/redux/actions/notifications';
import { useDispatch } from 'react-redux';
import { useIntl } from 'react-intl';
import messages from './Messages';
import {
  useGetEdgeDevicesQuery,
  useGetConventionalDevicesQuery,
} from './Services/SystemVariety';

export const AccountStatContext = createContext({
  hasConventionalSystems: true,
  hasEdgeDevices: false,
});

export const ZeroStateWrapper = ({ children }) => {
  const intl = useIntl();
  const dispatch = useDispatch();
  const [hasConventionalSystems, setHasConventionalSystems] = useState(true);
  const [hasEdgeDevices, setHasEdgeDevices] = useState(true);
  const {
    data: edge,
    isSuccess: edgeQuerySuccess,
    isError: edgeError,
    error: edgeErrorMessage,
  } = useGetEdgeDevicesQuery();
  const {
    data: conventional,
    isSuccess: conventionalQuerySuccess,
    isError: conventionalError,
    error: conventErrorMessage,
  } = useGetConventionalDevicesQuery();
  useEffect(() => {
    setHasEdgeDevices(edge?.total > 0);
    setHasConventionalSystems(conventional?.total > 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [edgeQuerySuccess, conventionalQuerySuccess]);

  useEffect(() => {
    if (edgeErrorMessage?.status || conventErrorMessage?.status) {
      dispatch(
        addNotification({
          variant: 'danger',
          dismissable: true,
          title: intl.formatMessage(messages.error),
          description:
            `${JSON.stringify(edgeErrorMessage?.data)}` ||
            `${JSON.stringify(conventErrorMessage?.data)}`,
        }),
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [edgeError, conventionalError]);

  const hasSystems = hasEdgeDevices || hasConventionalSystems;

  return (
    <Suspense
      fallback={
        <Bullseye>
          <Spinner size="xl" />
        </Bullseye>
      }
    >
      {!hasSystems && conventionalQuerySuccess ? (
        <Suspense
          fallback={
            <Bullseye>
              <Spinner size="xl" />
            </Bullseye>
          }
        >
          <AsynComponent
            appId={'advisor_zero_state'}
            module="./AppZeroState"
            scope="dashboard"
            ErrorComponent={<ErrorState />}
            app="Advisor"
          />
        </Suspense>
      ) : (
        <AccountStatContext.Provider
          value={{ hasConventionalSystems, hasEdgeDevices, edgeQuerySuccess }}
        >
          {children}
        </AccountStatContext.Provider>
      )}
    </Suspense>
  );
};

ZeroStateWrapper.propTypes = {
  children: PropTypes.element,
  check: PropTypes.boolean,
};
