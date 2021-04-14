import { Redirect, Route, Switch } from 'react-router-dom';
import React, { lazy, Suspense } from 'react';
import { Bullseye, Spinner } from '@patternfly/react-core';

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
  { title: 'Systems', path: '/systems:?', component: Systems },
  { title: 'Systems', path: '/systems', component: Systems },
  { title: 'Topics', path: '/topics', component: Topics },
];

export const Routes = () => (
  <Suspense
    fallback={
      <Bullseye>
        <Spinner size="xl" />
      </Bullseye>
    }
  >
    <Switch>
      {paths.map((path) => (
        <Route
          key={path.title}
          path={path.path}
          component={path.component}
          rootClass={path.rootClass}
        />
      ))}
      <Redirect path="/recommendations" to={`${paths[1].path}`} push />
      {/* Finally, catch all unmatched routes */}
      <Redirect path="*" to={`${paths[1].path}`} push />
    </Switch>
  </Suspense>
);
