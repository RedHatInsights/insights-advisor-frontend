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

const routeConfig = [
  {
    key: 'recsList',
    paths: ['recommendations', 'recommendations/pathways'],
    component: lazy(() => import('./SmartComponents/Recs/List')),
  },
  {
    key: 'recsDetails',
    paths: ['recommendations/:id'],
    component: lazy(() => import('./SmartComponents/Recs/Details')),
  },
  {
    key: 'recsDetailsImmutable',
    paths: ['recommendations/:id/manage-edge-inventory'],
    component: lazy(() => import('./SmartComponents/Recs/Details')),
    props: { isImmutableTabOpen: true },
  },
  {
    key: 'detailsPathways',
    paths: [
      'recommendations/pathways/:id',
      'recommendations/pathways/systems/:id',
    ],
    component: lazy(() => import('./SmartComponents/Recs/DetailsPathways')),
  },
  {
    key: 'detailsPathwaysImmutable',
    paths: ['recommendations/pathways/:id/manage-edge-inventory'],
    component: lazy(() => import('./SmartComponents/Recs/DetailsPathways')),
    props: { isImmutableTabOpen: true },
  },
  {
    key: 'inventoryDetails',
    paths: [
      'recommendations/:id/:inventoryId/',
      'recommendations/pathways/systems/:id/:inventoryId/',
      'recommendations/pathways/:id/:inventoryId/',
      'systems/:inventoryId/',
    ],
    component: lazy(() =>
      import('./PresentationalComponents/Inventory/InventoryDetails')
    ),
  },
  {
    key: 'systemsList',
    paths: ['systems'],
    component: lazy(() => import('./SmartComponents/Systems/List')),
  },
  {
    key: 'topicsList',
    paths: ['topics'],
    component: lazy(() => import('./SmartComponents/Topics/List')),
  },
  {
    key: 'topicDetails',
    paths: ['topics/:id'],
    component: lazy(() => import('./SmartComponents/Topics/Details')),
  },
  {
    key: 'topicAdmin',
    paths: ['topics/admin/manage'],
    component: lazy(() =>
      import('./PresentationalComponents/TopicsAdminTable/TopicsAdminTable')
    ),
  },
  {
    key: 'advisorFallback',
    paths: ['*'],
    component: () => <Navigate replace to="recommendations" />,
  },
];

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
  const [isLoading, setIsLoading] = useState(true);

  const {
    data: edge,
    isSuccess: edgeQuerySuccess,
    isError: edgeError,
    error: edgeErrorMessage,
    isLoading: isEdgeLoading,
  } = useGetEdgeDevicesQuery();

  const {
    data: conventional,
    isSuccess: conventionalQuerySuccess,
    isError: conventionalError,
    error: conventErrorMessage,
    isLoading: isConventionalLoading,
  } = useGetConventionalDevicesQuery();

  useEffect(() => {
    if (edgeQuerySuccess) {
      setHasEdgeDevices(edge?.total > 0);
    }
    if (conventionalQuerySuccess) {
      setHasConventionalSystems(conventional?.total > 0);
    }

    if (!isEdgeLoading && !isConventionalLoading) {
      setIsLoading(false);
    }
  }, [
    edgeQuerySuccess,
    conventionalQuerySuccess,
    isEdgeLoading,
    isConventionalLoading,
  ]);

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

  if (isLoading) {
    return <Spinner />;
  }

  return (
    <AsyncComponent
      appId="advisor_zero_state"
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
            {routeConfig.map(({ key, paths, component: Component, props }) =>
              paths.map((path) => (
                <Route
                  key={`${key}-${path}`}
                  path={path}
                  element={<Component {...props} />}
                />
              ))
            )}
          </Routes>
        </AccountStatContext.Provider>
      </Suspense>
    </AsyncComponent>
  );
};
