import React, {
  Suspense,
  useState,
  useEffect,
  createContext,
  useContext,
} from 'react';
import { Bullseye, Spinner } from '@patternfly/react-core';
import AsynComponent from '@redhat-cloud-services/frontend-components/AsyncComponent';
import ErrorState from '@redhat-cloud-services/frontend-components/ErrorState';
import PropTypes from 'prop-types';
import { addNotification } from '@redhat-cloud-services/frontend-components-notifications/redux/actions/notifications';
import { useDispatch } from 'react-redux';
import { useIntl } from 'react-intl';
import messages from './Messages';
import { useGetConventionalDevicesQuery } from './Services/SystemVariety';
import { EnvironmentContext } from './App';
import { INVENTORY_BASE_URL } from './AppConstants';

export const AccountStatContext = createContext({
  hasConventionalSystems: true,
  hasEdgeDevices: false,
});

export const ZeroStateWrapper = ({ children }) => {
  const intl = useIntl();
  const dispatch = useDispatch();
  const envContext = useContext(EnvironmentContext);
  const [hasConventionalSystems, setHasConventionalSystems] = useState(true);

  const {
    data: conventional,
    isSuccess: conventionalQuerySuccess,
    isError: conventionalError,
    error: conventErrorMessage,
  } = useGetConventionalDevicesQuery({
    customBasePath: envContext.INVENTORY_BASE_URL,
    inventoryBasePath: INVENTORY_BASE_URL,
  });

  useEffect(() => {
    setHasConventionalSystems(conventional?.total > 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conventionalQuerySuccess]);

  useEffect(() => {
    if (conventErrorMessage?.status) {
      dispatch(
        addNotification({
          variant: 'danger',
          dismissable: true,
          title: intl.formatMessage(messages.error),
          description: `${JSON.stringify(conventErrorMessage?.data)}`,
        }),
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conventionalError]);

  const hasSystems = hasConventionalSystems;

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
        <AccountStatContext.Provider value={{ hasConventionalSystems }}>
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
