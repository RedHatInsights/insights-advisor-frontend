import React from 'react';
import propTypes from 'prop-types';
import { Skeleton } from '@patternfly/react-core';

const DetailsTitle = ({ areCountsLoading, systemsCount }) => {
  if (areCountsLoading) {
    return <Skeleton width="25%" aria-label="Table title skeleton" />;
  }

  return `${systemsCount} Affected System${systemsCount !== 1 ? 's' : ''}`;
};

DetailsTitle.propTypes = {
  areCountsLoading: propTypes.bool,
  hasEdgeDevices: propTypes.bool,
  systemsCount: propTypes.number,
};

export default DetailsTitle;
