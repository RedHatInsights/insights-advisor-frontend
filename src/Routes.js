import { Bullseye, Spinner } from '@patternfly/react-core';
import React, { Suspense, lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

const Recs = lazy(() =>
  import(/* webpackChunkName: "Recs" */ './SmartComponents/Recs/Recs')
);
const Systems = lazy(() =>
  import(/* webpackChunkName: "Systems" */ './SmartComponents/Systems/Systems')
);
const Topics = lazy(() =>
  import(/* webpackChunkName: "Topics" */ './SmartComponents/Topics/Topics')
);

const paths = [
  { title: 'Recommendations', path: '/recommendations:?', component: Recs },
  { title: 'Recommendations', path: '/recommendations', component: Recs },
  {
    title: 'Pathways',
    path: '/recommendations/pathways',
    component: Recs,
  },
  {
    title: 'Pathways',
    path: '/recommendations/pathways:?',
    component: Recs,
  },
  {
    title: 'Pathways',
    path: '/recommendations/pathways/systems:?',
    component: Recs,
  },

  { title: 'Systems', path: '/systems:?', component: Systems },
  { title: 'Systems', path: '/systems', component: Systems },
  { title: 'Topics', path: '/topics', component: Topics },
];

export const RhelRoutes = () => (
  <Suspense
    fallback={
      <Bullseye>
        <Spinner size="xl" />
      </Bullseye>
    }
  >
    <Routes>
      {paths.map((path) => (
        <Route
          key={path.title}
          path={path.path}
          element={<path.component />}
          rootClass={path.rootClass}
        />
      ))}
      <Route
        element={
          <Navigate path="/recommendations" to={`${paths[1].path}`} push />
        }
      />
      <Route element={<Navigate path="*" to={`${paths[1].path}`} push />} />
    </Routes>
  </Suspense>
);
