import React from 'react';
import propTypes from 'prop-types';
import { Skeleton } from '@patternfly/react-core';
import { useFeatureFlag } from '../../Utilities/Hooks';

const DetailsTitle = ({ areCountsLoading, hasEdgeDevices, systemsCount }) => {
  const isEdgeParityEnabled = useFeatureFlag('advisor.edge_parity');

  if (areCountsLoading) {
    return <Skeleton width="25%" aria-label="Table title skeleton" />;
  }

  return hasEdgeDevices && isEdgeParityEnabled
    ? `${systemsCount} Total Systems`
    : 'Affected Systems';
};

DetailsTitle.propTypes = {
  areCountsLoading: propTypes.bool,
  hasEdgeDevices: propTypes.bool,
  systemsCount: propTypes.number,
};

export default DetailsTitle;
