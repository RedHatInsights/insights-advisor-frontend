import React, { Suspense, lazy } from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';

import Loading from '../../PresentationalComponents/Loading/Loading';

const List = lazy(() => import(/* webpackChunkName: "List" */ './List'));
const Details = lazy(() =>
  import(/* webpackChunkName: "Details" */ './Details')
);
const DetailsPathways = lazy(() =>
  import(/* webpackChunkName: "Details-Pathways" */ './DetailsPathways')
);
const InventoryDetails = lazy(() =>
  import(
    /* InventoryDetails: "Details" */ '../../PresentationalComponents/Inventory/InventoryDetails'
  )
);
const ClassicRedirect = lazy(() =>
  import(/* webpackChunkName: "ClassicRedirect" */ '../Common/ClassicRedirect')
);

// eslint-disable-next-line react/prop-types
const SuspenseHelper = ({ children }) => (
  <Suspense fallback={<Loading />}>{children}</Suspense>
);

const Recs = () => (
  <React.Fragment>
    <Switch>
      <Route
        exact
        path="/recommendations"
        component={() => (
          <SuspenseHelper>
            <List />
          </SuspenseHelper>
        )}
      />
      <Route
        exact
        path="/recommendations/by_id/:id"
        component={() => (
          <SuspenseHelper>
            <List />
          </SuspenseHelper>
        )}
      />
      <Route
        exact
        path="/recommendations/pathways"
        component={() => (
          <SuspenseHelper>
            <List />
          </SuspenseHelper>
        )}
      />
      <Route
        exact
        path="/recommendations/pathways/:id"
        component={() => (
          <SuspenseHelper>
            <DetailsPathways />
          </SuspenseHelper>
        )}
      />
      <Route
        exact
        path="/recommendations/pathways/systems/:id"
        component={() => (
          <SuspenseHelper>
            <DetailsPathways />
          </SuspenseHelper>
        )}
      />
      <Route
        exact
        path="/recommendations/:id"
        component={() => (
          <SuspenseHelper>
            <Details />
          </SuspenseHelper>
        )}
      />
      <Route
        exact
        path="/recommendations/classic/:id/:classicId/"
        component={() => (
          <SuspenseHelper>
            <ClassicRedirect />
          </SuspenseHelper>
        )}
      />
      <Route
        path="/recommendations/by_id/:id/:inventoryId/"
        component={() => (
          <SuspenseHelper>
            <InventoryDetails />
          </SuspenseHelper>
        )}
      />
      <Route
        path="/recommendations/:id/:inventoryId/"
        component={() => (
          <SuspenseHelper>
            <InventoryDetails />{' '}
          </SuspenseHelper>
        )}
      />
      <Redirect path="*" to="/recommendations" push />
    </Switch>
  </React.Fragment>
);

export default Recs;
