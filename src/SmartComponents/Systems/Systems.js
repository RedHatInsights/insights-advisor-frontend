import React, { Suspense, lazy } from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';

import Loading from '../../PresentationalComponents/Loading/Loading';

const List = lazy(() => import(/* webpackChunkName: "List" */ './List'));
const Details = lazy(() =>
  import(
    /* webpackChunkName: "InventoryDetails" */ '../../PresentationalComponents/Inventory/InventoryDetails'
  )
);
const ClassicRedirect = lazy(() =>
  import(/* webpackChunkName: "ClassicRedirect" */ '../Common/ClassicRedirect')
);

const suspenseHelper = (component) => (
  <Suspense fallback={<Loading />}>{component}</Suspense>
);

// This should move up the the Routes.js
const Systems = () => (
  <React.Fragment>
    <Switch>
      <Route exact path="/systems" component={() => suspenseHelper(<List />)} />
      <Route
        exact
        path="/systems/:inventoryId/"
        component={() => suspenseHelper(<Details />)}
      />
      <Route
        exact
        path="/systems/classic/:classicId"
        component={() => suspenseHelper(<ClassicRedirect />)}
      />
      <Redirect path="*" to="/systems" push />
    </Switch>
  </React.Fragment>
);

export default Systems;
