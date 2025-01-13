import React, { Suspense, lazy, useContext } from 'react';
import propTypes from 'prop-types';
import AsynComponent from '@redhat-cloud-services/frontend-components/AsyncComponent';
import { useFeatureFlag } from '../../Utilities/Hooks';
import { AccountStatContext } from '../../ZeroStateWrapper';
import { Bullseye, Spinner } from '@patternfly/react-core';

const ImmutableDevices = lazy(() =>
  import(/* webpackChunkName: "ImmutableDevices" */ './ImmutableDevices')
);

const RecommendationSystems = lazy(() =>
  import(
    /* webpackChunkName: "RecommendationSystems" */ './ConventionalSystems/RecommendationSystems'
  )
);

const PathwaySystems = lazy(() =>
  import(
    /* webpackChunkName: "PathwaySystems" */ './ConventionalSystems/PathwaySystems'
  )
);

const HybridInventory = ({
  isImmutableTabOpen,
  conventionalSystemsCount,
  edgeSystemsCount,
  areCountsLoading,
  tabPathname,
  ...tabProps
}) => {
  const isEdgeParityEnabled = useFeatureFlag('advisor.edge_parity');
  const { hasEdgeDevices } = useContext(AccountStatContext);

  return areCountsLoading ? (
    <Bullseye>
      <Spinner size="lg" />
    </Bullseye>
  ) : (
    <AsynComponent
      key="hybridInventory"
      appName="inventory"
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
      ImmutableDevicesTab={
        <Suspense
          fallback={
            <Bullseye>
              <Spinner size="xl" />
            </Bullseye>
          }
        >
          <ImmutableDevices {...tabProps} />
        </Suspense>
      }
      tabPathname={tabPathname}
      isImmutableTabOpen={isImmutableTabOpen}
      fallback={<div />}
      columns
      isEdgeParityEnabled={isEdgeParityEnabled}
      accountHasEdgeImages={hasEdgeDevices}
      hasConventionalSystems={
        conventionalSystemsCount > 0 || edgeSystemsCount <= 0
      }
    />
  );
};

HybridInventory.propTypes = {
  isImmutableTabOpen: propTypes.bool,
  conventionalSystemsCount: propTypes.number,
  edgeSystemsCount: propTypes.number,
  areCountsLoading: propTypes.bool,
  tabPathname: propTypes.string,
  rule: propTypes.object,
  isRecommendationDetail: propTypes.bool,
};

export default HybridInventory;
