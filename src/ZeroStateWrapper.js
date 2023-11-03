import React, { Suspense, useState, useEffect, createContext } from 'react';
import { Bullseye, Spinner } from '@patternfly/react-core';
import AsynComponent from '@redhat-cloud-services/frontend-components/AsyncComponent';
import ErrorState from '@redhat-cloud-services/frontend-components/ErrorState';
import PropTypes from 'prop-types';
import axios from 'axios';
import { addNotification } from '@redhat-cloud-services/frontend-components-notifications/redux/actions/notifications';
import { useDispatch } from 'react-redux';
import { useIntl } from 'react-intl';
import messages from './Messages';
import { useFeatureFlag } from './Utilities/Hooks';

export const AccountStatContext = createContext({
  hasConventionalSystems: true,
  hasEdgeDevices: false,
});

export const ZeroStateWrapper = ({ children }) => {
  const intl = useIntl();
  const dispatch = useDispatch();
  const isEdgeParityEnabled = useFeatureFlag('advisor.edge_parity');
  const [hasConventionalSystems, setHasConventionalSystems] = useState(true);
  const [hasEdgeDevices, setHasEdgeDevices] = useState(true);

  useEffect(() => {
    try {
      axios
        .get(
          `/api/inventory/v1/hosts?page=1&per_page=1&filter[system_profile][host_type]=nil`
        )
        .then(({ data }) => {
          setHasConventionalSystems(data.total > 0);
        });
      axios
        .get(
          `/api/inventory/v1/hosts?page=1&per_page=1&filter[system_profile][host_type]=edge`
        )
        .then(({ data }) => {
          setHasEdgeDevices(data.total > 0);
        });
    } catch (e) {
      dispatch(
        addNotification({
          variant: 'danger',
          dismissable: true,
          title: intl.formatMessage(messages.error),
          description: `${e}`,
        })
      );
    }
  }, []);

  const hasSystems = isEdgeParityEnabled
    ? hasEdgeDevices || hasConventionalSystems
    : hasConventionalSystems;

  return (
    <Suspense
      fallback={
        <Bullseye>
          <Spinner size="xl" />
        </Bullseye>
      }
    >
      {!hasSystems ? (
        <Suspense
          fallback={
            <Bullseye>
              <Spinner size="xl" />
            </Bullseye>
          }
        >
          <AsynComponent
            appId={'advisor_zero_state'}
            appName="dashboard"
            module="./AppZeroState"
            scope="dashboard"
            ErrorComponent={<ErrorState />}
            app="Advisor"
          />
        </Suspense>
      ) : (
        <>{children}</>
      )}
    </Suspense>
  );
};

ZeroStateWrapper.propTypes = {
  children: PropTypes.element,
  check: PropTypes.boolean,
};
