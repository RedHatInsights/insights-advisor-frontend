import React, { Suspense, lazy } from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';

import Loading from '../../PresentationalComponents/Loading/Loading';

const List = lazy(() => import(/* webpackChunkName: "List" */ './List'));
const Details = lazy(() =>
  import(/* webpackChunkName: "Details" */ './Details')
);
const InventoryDetails = lazy(() =>
  import(
    /* InventoryDetails: "Details" */ '../../PresentationalComponents/Inventory/InventoryDetails'
  )
);
const ClassicRedirect = lazy(() =>
  import(/* webpackChunkName: "ClassicRedirect" */ '../Common/ClassicRedirect')
);

const suspenseHelper = (component) => (
  <Suspense fallback={<Loading />}>{component}</Suspense>
);
const Recs = () => (
  <React.Fragment>
    <Switch>
      <Route
        exact
        path="/recommendations"
        component={() => suspenseHelper(<List />)}
      />
      <Route
        exact
        path="/recommendations/by_id/:id"
        component={() => suspenseHelper(<List />)}
      />
      <Route
        exact
        path="/recommendations/:id"
        component={() => suspenseHelper(<Details />)}
      />
      <Route
        exact
        path="/recommendations/classic/:id/:classicId/"
        component={() => suspenseHelper(<ClassicRedirect />)}
      />
      <Route
        path="/recommendations/by_id/:id/:inventoryId/"
        component={() => suspenseHelper(<InventoryDetails />)}
      />
      <Route
        path="/recommendations/:id/:inventoryId/"
        component={() => suspenseHelper(<InventoryDetails />)}
      />
      <Redirect path="*" to="/recommendations" push />
    </Switch>
  </React.Fragment>
);

export default Recs;
