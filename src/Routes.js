import { Bullseye, Spinner } from '@patternfly/react-core';
import axios from 'axios';
import React, { Suspense, lazy, useEffect, useState } from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';

const RecsList = lazy(() =>
  import(/* webpackChunkName: "RecsList" */ './SmartComponents/Recs/List')
);
const RecsDetails = lazy(() =>
  import(/* webpackChunkName: "RecsDetails" */ './SmartComponents/Recs/Details')
);
const DetailsPathways = lazy(() =>
  import(
    /* webpackChunkName: "Details-Pathways" */ './SmartComponents/Recs/DetailsPathways'
  )
);
const InventoryDetails = lazy(() =>
  import(
    /* InventoryDetails: "Details" */ './PresentationalComponents/Inventory/InventoryDetails'
  )
);
const SystemsList = lazy(() =>
  import(/* webpackChunkName: "List" */ './SmartComponents/Systems/List')
);
const TopicsList = lazy(() =>
  import(/* webpackChunkName: "TopicsList" */ './SmartComponents/Topics/List')
);
const TopicDetails = lazy(() =>
  import(
    /* webpackChunkName: "TopicDetails" */ './SmartComponents/Topics/Details'
  )
);
const TopicAdmin = lazy(() =>
  import(
    /* webpackChunkName: "TopicAdmin" */ './PresentationalComponents/TopicsAdminTable/TopicsAdminTable'
  )
);
const AdminProtectedRoute = lazy(() =>
  import(
    /* webpackChunkName: "TopicAdmin" */ './PresentationalComponents/TopicsAdminTable/TopicsAdminTable'
  )
);

const paths = [
  //Recommendations nav -> recommendations tab is active
  { title: 'Recommendations', path: '/recommendations', component: RecsList },
  //Recommendations nav -> pathways tab is active
  {
    title: 'Recommendations Pathways',
    path: '/recommendations/pathways',
    component: RecsList,
  },
  //Pathway details =>  recommendations tab is active
  {
    title: 'Pathway details',
    path: '/recommendations/pathways/:id',
    component: DetailsPathways,
  },
  //Pathway details =>  systems tab is active
  {
    title: 'Pathway details',
    path: '/recommendations/pathways/systems/:id',
    component: DetailsPathways,
  },
  {
    title: 'Recommendation details',
    path: '/recommendations/:id',
    component: RecsDetails,
  },
  {
    title: 'Inventory details',
    path: '/recommendations/:id/:inventoryId/',
    component: InventoryDetails,
  },
  {
    title: 'Inventory details',
    path: '/recommendations/pathways/:id/:inventoryId/',
    component: InventoryDetails,
  },
  { title: 'Systems', path: '/systems', component: SystemsList },
  {
    title: 'System detail',
    path: '/systems/:inventoryId/',
    component: InventoryDetails,
  },
  { title: 'Topics', path: '/topics', component: TopicsList },
  { title: 'Topic details', path: '/topics/:id', component: TopicDetails },
];
const INVENTORY_TOTAL_FETCH_URL = '/api/inventory/v1/hosts';

export const Routes = () => {
  const [hasSystems, setHasSystems] = useState(true);
  useEffect(() => {
    try {
      axios
        .get(`${INVENTORY_TOTAL_FETCH_URL}?page=1&per_page=1`)
        .then(({ data }) => {
          setHasSystems(data.total > 0);
        });
    } catch (e) {
      console.log(e);
    }
  }, [hasSystems]);

  return (
    <Suspense
      fallback={
        <Bullseye>
          <Spinner size="xl" />
        </Bullseye>
      }
    >
      {!hasSystems ? (
        <div>ZERO STATE</div>
      ) : (
        <Switch>
          {paths.map((path) => (
            <Route
              key={path.title}
              path={path.path}
              exact
              component={path.component}
              rootClass={path.rootClass}
            />
          ))}
          <AdminProtectedRoute
            exact
            path="/topics/admin/manage"
            component={() => <TopicAdmin />}
          />
          <Redirect path="/recommendations" to={`${paths[1].path}`} push />
          {/* Finally, catch all unmatched routes */}
          <Redirect path="*" to={`${paths[1].path}`} push />
        </Switch>
      )}
    </Suspense>
  );
};
