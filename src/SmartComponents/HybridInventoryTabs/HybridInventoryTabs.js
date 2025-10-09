import React, { Suspense, lazy } from 'react';
import propTypes from 'prop-types';
import AsynComponent from '@redhat-cloud-services/frontend-components/AsyncComponent';
import { Bullseye, Spinner } from '@patternfly/react-core';

const RecommendationSystems = lazy(
  () =>
    import(
      /* webpackChunkName: "RecommendationSystems" */ './ConventionalSystems/RecommendationSystems'
    ),
);

const PathwaySystems = lazy(
  () =>
    import(
      /* webpackChunkName: "PathwaySystems" */ './ConventionalSystems/PathwaySystems'
    ),
);

const HybridInventory = ({
  conventionalSystemsCount,
  areCountsLoading,
  tabPathname,
  ...tabProps
}) => {
  return areCountsLoading ? (
    <Bullseye>
      <Spinner size="lg" />
    </Bullseye>
  ) : (
    <AsynComponent
      key="hybridInventory"
      scope="inventory"
      module="./HybridInventoryTabs"
      ConventionalSystemsTab={
        <Suspense
          fallback={
            <Bullseye>
              <Spinner size="xl" />
            </Bullseye>
          }
        >
          {tabProps.isRecommendationDetail ? (
            <RecommendationSystems {...tabProps} />
          ) : (
            <PathwaySystems {...tabProps} />
          )}
        </Suspense>
      }
      tabPathname={tabPathname}
      fallback={<div />}
      columns
      hasConventionalSystems={conventionalSystemsCount > 0}
    />
  );
};

HybridInventory.propTypes = {
  conventionalSystemsCount: propTypes.number,
  areCountsLoading: propTypes.bool,
  tabPathname: propTypes.string,
  rule: propTypes.object,
  isRecommendationDetail: propTypes.bool,
};

export default HybridInventory;
