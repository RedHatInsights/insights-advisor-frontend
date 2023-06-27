import React, { lazy, useState, useEffect } from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import axios from 'axios';
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
const TopicAdmin = lazy(() =>
  import(
    /* webpackChunkName: "TopicAdmin" */ './PresentationalComponents/TopicsAdminTable/TopicsAdminTable'
  )
);

export const AdvisorRoutes = () => {
  const [hasSystems, setHasSystems] = useState(true);
  useEffect(() => {
    try {
      axios
        .get(`/api/inventory/v1/hosts?page=1&per_page=1`)
        .then(({ data }) => {
          setHasSystems(data.total > 0);
        });
    } catch (e) {
      console.log(e);
    }
  }, [hasSystems]);
  return (
    <Routes>
      <Route
        key={'Recommendations'}
        path="recommendations"
        element={
          <ZeroState check={hasSystems}>
            <RecsList />
          </ZeroState>
        }
      ></Route>
      <Route
        key={'Recommendations Pathways'}
        path="recommendations/pathways"
        element={
          <ZeroState check={hasSystems}>
            <RecsList />
          </ZeroState>
        }
      ></Route>
      <Route
        key={'Pathway details'}
        path="recommendations/pathways/:id"
        element={
          <ZeroState check={hasSystems}>
            <DetailsPathways />
          </ZeroState>
        }
      ></Route>
      <Route
        key={'Pathway details'}
        path="recommendations/pathways/systems/:id"
        element={
          <ZeroState check={hasSystems}>
            <DetailsPathways />
          </ZeroState>
        }
      ></Route>
      <Route
        key={'Recommendation details'}
        path="recommendations/:id"
        element={
          <ZeroState check={hasSystems}>
            <RecsDetails />
          </ZeroState>
        }
      ></Route>
      <Route
        key={'Inventory details'}
        path="recommendations/:id/:inventoryId/"
        element={
          <ZeroState check={hasSystems}>
            <InventoryDetails />
          </ZeroState>
        }
      ></Route>
      <Route
        key={'Inventory details'}
        path="recommendations/pathways/:id/:inventoryId/"
        element={
          <ZeroState check={hasSystems}>
            <InventoryDetails />
          </ZeroState>
        }
      ></Route>
      <Route
        key={'Systems'}
        path="systems"
        element={
          <ZeroState check={hasSystems}>
            <SystemsList />
          </ZeroState>
        }
      ></Route>
      <Route
        key={'System detail'}
        path="systems/:inventoryId/"
        element={
          <ZeroState check={hasSystems}>
            <InventoryDetails />
          </ZeroState>
        }
      ></Route>
      <Route
        key={'Topics'}
        path="topics"
        element={
          <ZeroState check={hasSystems}>
            <TopicsList />
          </ZeroState>
        }
      ></Route>
      <Route
        key={'Topic details'}
        path="topics/:id"
        element={
          <ZeroState check={hasSystems}>
            <TopicDetails />
          </ZeroState>
        }
      ></Route>
      <Route
        key={'TopicAdmin'}
        path="topics/admin/manage"
        element={
          <ZeroState check={hasSystems}>
            <TopicAdmin />
          </ZeroState>
        }
      ></Route>
      {/* this redirect will be replaced with the redirect to the overview page when it's ready */}
      <Route
        key={'Advisor'}
        path="*"
        element={<Navigate replace to="recommendations" />}
      ></Route>
    </Routes>
  );
};
