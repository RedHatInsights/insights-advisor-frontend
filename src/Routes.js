import React, { lazy } from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import { ZeroState } from './ZeroState';

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
const AdminProtectedRoute = lazy(() =>
  import(
    /* webpackChunkName: "TopicAdmin" */ './PresentationalComponents/TopicsAdminTable/TopicsAdminTable'
  )
);

export const AdvisorRoutes = () => {
  return (
    <ZeroState>
      <Routes>
        <Route
          key={'Recommendations'}
          path="recommendations"
          element={<RecsList />}
        ></Route>
        <Route
          key={'Recommendations Pathways'}
          path="recommendations/pathways"
          element={<RecsList />}
        ></Route>
        <Route
          key={'Pathway details'}
          path="recommendations/pathways/:id"
          element={<DetailsPathways />}
        ></Route>
        <Route
          key={'Pathway details'}
          path="recommendations/pathways/systems/:id"
          element={<DetailsPathways />}
        ></Route>
        <Route
          key={'Recommendation details'}
          path="recommendations/:id"
          element={<RecsDetails />}
        ></Route>
        <Route
          key={'Inventory details'}
          path="recommendations/:id/:inventoryId/"
          element={<InventoryDetails />}
        ></Route>
        <Route
          key={'Inventory details'}
          path="recommendations/pathways/:id/:inventoryId/"
          element={<InventoryDetails />}
        ></Route>
        <Route
          key={'Inventory details'}
          path="recommendations/pathways/systems/:id/:inventoryId/"
          element={<InventoryDetails />}
        ></Route>
        <Route key={'Systems'} path="systems" element={<SystemsList />}></Route>
        <Route
          key={'System detail'}
          path="systems/:inventoryId/"
          element={<InventoryDetails />}
        ></Route>
        <Route key={'Topics'} path="topics" element={<TopicsList />}></Route>
        <Route
          key={'Topic details'}
          path="topics/:id"
          element={<TopicDetails />}
        ></Route>
        {/* this redirect will be replaced with the redirect to the overview page when it's ready */}
        <Route
          key={'Advisor'}
          path="*"
          element={<Navigate replace to="recommendations" />}
        ></Route>
        <Route
          key={'TopicAdmin'}
          path="/topics/admin/manage"
          element={<AdminProtectedRoute />}
        ></Route>
      </Routes>
    </ZeroState>
  );
};
