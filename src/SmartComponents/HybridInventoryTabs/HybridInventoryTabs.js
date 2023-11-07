import React, { Suspense, Fragment, lazy, useContext } from 'react';
import propTypes from 'prop-types';
import AsynComponent from '@redhat-cloud-services/frontend-components/AsyncComponent';
import { useFeatureFlag } from '../../Utilities/Hooks';
import { AccountStatContext } from '../../ZeroStateWrapper';

const ImmutableDevices = lazy(() =>
  import(/* webpackChunkName: "ImmutableDevices" */ './ImmutableDevices')
);

const ConventionalSystems = lazy(() =>
  import(/* webpackChunkName: "ConventionalSystems" */ './ConventionalSystems')
);

const HybridInventory = (props) => {
  const isEdgeParityEnabled = useFeatureFlag('advisor.edge_parity');
  const { hasEdgeDevices, hasConventionalSystems } =
    useContext(AccountStatContext);

  return (
    <AsynComponent
      key="hybridInventory"
      appName="inventory"
      module="./HybridInventoryTabs"
      ConventionalSystemsTab={
        <Suspense fallback={Fragment}>
          <ConventionalSystems {...props} />
        </Suspense>
      }
      ImmutableDevicesTab={
        <Suspense fallback={Fragment}>
          <ImmutableDevices {...props} />
        </Suspense>
      }
      tabPathname={`/insights/advisor/recommendations/${props.ruleId}`}
      //TODO: uncomment when ImmutableDevices tab is ready RHIF-307
      //isImmutableTabOpen={props.isImmutableTabOpen}
      fallback={<div />}
      columns
      isEdgeParityEnabled={isEdgeParityEnabled}
      accountHasEdgeImages={hasEdgeDevices}
      hasConventionalSystems={hasConventionalSystems}
    />
  );
};

HybridInventory.propTypes = {
  isImmutableTabOpen: propTypes.bool,
  ruleId: propTypes.string,
};

export default HybridInventory;
