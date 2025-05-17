import React from 'react';
import propTypes from 'prop-types';
import { Skeleton } from '@patternfly/react-core';

const DetailsTitle = ({ areCountsLoading, hasEdgeDevices, systemsCount }) => {
  if (areCountsLoading) {
    return <Skeleton width="25%" aria-label="Table title skeleton" />;
  }

  return hasEdgeDevices ? `${systemsCount} Total Systems` : 'Affected Systems';
};

DetailsTitle.propTypes = {
  areCountsLoading: propTypes.bool,
  hasEdgeDevices: propTypes.bool,
  systemsCount: propTypes.number,
};

export default DetailsTitle;
