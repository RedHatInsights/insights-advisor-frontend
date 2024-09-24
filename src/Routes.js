import React, {
  lazy,
  Suspense,
  useEffect,
  useState,
  createContext,
} from 'react';
import { Route, Routes } from 'react-router-dom';
import ErrorState from '@redhat-cloud-services/frontend-components/ErrorState';
import Messages from './Messages';
import {
  useGetConventionalDevicesQuery,
  useGetEdgeDevicesQuery,
} from './Services/SystemVariety';
import { useIntl } from 'react-intl';
import { useDispatch } from 'react-redux';
import { useFeatureFlag } from './Utilities/Hooks';
import AsyncComponent from '@redhat-cloud-services/frontend-components/AsyncComponent';
import { Spinner } from '@patternfly/react-core';
import { addNotification } from '@redhat-cloud-services/frontend-components-notifications/redux/actions/notifications';

const routes = {
  recsList: {
    path: 'recommendations',
    component: lazy(() =>
      import(/* webpackChunkName: "RecsList" */ './SmartComponents/Recs/List')
    ),
  },
  recsDetails: {
    path: 'recommendations/:id',
    component: lazy(() =>
      import(
        /* webpackChunkName: "RecsDetails" */ './SmartComponents/Recs/Details'
      )
    ),
  },
  recsDetailsPathways: {
    path: 'recommendations/pathways/:id',
    component: lazy(() =>
      import(
        /* webpackChunkName: "Details-Pathways" */ './SmartComponents/Recs/DetailsPathways'
      )
    ),
  },
  inventoryDetails: {
    path: 'recommendations/:id/:inventoryId',
    component: lazy(() =>
      import(
        /* webpackChunkName: "InventoryDetails" */ './PresentationalComponents/Inventory/InventoryDetails'
      )
    ),
  },
  systemsList: {
    path: 'systems',
    component: lazy(() =>
      import(/* webpackChunkName: "List" */ './SmartComponents/Systems/List')
    ),
  },
  systemsDetails: {
    path: 'systems/:inventoryId',
    component: lazy(() =>
      import(
        /* webpackChunkName: "InventoryDetails" */ './PresentationalComponents/Inventory/InventoryDetails'
      )
    ),
  },
  topicsList: {
    path: 'topics',
    component: lazy(() =>
      import(
        /* webpackChunkName: "TopicsList" */ './SmartComponents/Topics/List'
      )
    ),
  },
  topicDetails: {
    path: 'topics/:id',
    component: lazy(() =>
      import(
        /* webpackChunkName: "TopicDetails" */ './SmartComponents/Topics/Details'
      )
    ),
  },
  topicAdmin: {
    path: '/topics/admin/manage',
    component: lazy(() =>
      import(
        /* webpackChunkName: "TopicAdmin" */ './PresentationalComponents/TopicsAdminTable/TopicsAdminTable'
      )
    ),
  },
};

export const AccountStatContext = createContext({
  hasConventionalSystems: true,
  hasEdgeDevices: false,
});

export const AdvisorRoutes = () => {
  const intl = useIntl();
  const dispatch = useDispatch();
  const isEdgeParityEnabled = useFeatureFlag('advisor.edge_parity');
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
          title: intl.formatMessage(Messages.error),
          description:
            `${JSON.stringify(edgeErrorMessage?.data)}` ||
            `${JSON.stringify(conventErrorMessage?.data)}`,
        })
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [edgeError, conventionalError]);

  const hasSystems = isEdgeParityEnabled
    ? hasEdgeDevices || hasConventionalSystems
    : hasConventionalSystems;

  return (
    <AsyncComponent
      appId={'advisor_zero_state'}
      appName="dashboard"
      module="./AppZeroState"
      scope="dashboard"
      customFetchResults={hasSystems && conventionalQuerySuccess}
      ErrorComponent={<ErrorState />}
      app="Advisor"
    >
      <Suspense fallback={<Spinner />}>
        <AccountStatContext.Provider
          value={{ hasConventionalSystems, hasEdgeDevices, edgeQuerySuccess }}
        >
          <Routes>
            {Object.entries(routes).map(
              ([key, { path, component: Component }]) => (
                <Route key={key} path={path} element={<Component />} />
              )
            )}
          </Routes>
        </AccountStatContext.Provider>
      </Suspense>
    </AsyncComponent>
  );
};
