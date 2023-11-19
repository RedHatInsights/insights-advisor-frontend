import React, { Suspense, Fragment, lazy, useContext } from 'react';
import propTypes from 'prop-types';
import AsynComponent from '@redhat-cloud-services/frontend-components/AsyncComponent';
import { useFeatureFlag } from '../../Utilities/Hooks';
import { AccountStatContext } from '../../ZeroStateWrapper';
import { Bullseye, Spinner } from '@patternfly/react-core';

const ImmutableDevices = lazy(() =>
  import(/* webpackChunkName: "ImmutableDevices" */ './ImmutableDevices')
);

const ConventionalSystems = lazy(() =>
  import(
    /* webpackChunkName: "ConventionalSystems" */ './ConventionalSystems/RecommendationSystems'
  )
);

const HybridInventory = ({
  ruleId,
  isImmutableTabOpen,
  conventionalSystemsCount,
  edgeSystemsCount,
  areCountsLoading,
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
        <Suspense fallback={Fragment}>
          <ConventionalSystems {...tabProps} />
        </Suspense>
      }
      ImmutableDevicesTab={
        <Suspense fallback={Fragment}>
          <ImmutableDevices {...tabProps} />
        </Suspense>
      }
      tabPathname={`/insights/advisor/recommendations/${ruleId}`}
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
  ruleId: propTypes.string,
  conventionalSystemsCount: propTypes.number,
  edgeSystemsCount: propTypes.number,
  areCountsLoading: propTypes.bool,
};

export default HybridInventory;
