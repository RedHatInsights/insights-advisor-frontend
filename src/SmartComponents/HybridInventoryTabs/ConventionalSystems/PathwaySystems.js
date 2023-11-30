import React from 'react';
import PropTypes from 'prop-types';
import Inventory from '../../../PresentationalComponents/Inventory/Inventory';

const PathwaySystems = ({ pathway, selectedTags, workloads, SID }) => (
  <Inventory
    tableProps={{
      canSelectAll: false,
      isStickyHeader: true,
    }}
    pathway={pathway}
    selectedTags={selectedTags}
    workloads={workloads}
    SID={SID}
    showTags
  />
);

PathwaySystems.propTypes = {
  pathway: PropTypes.object,
  selectedTags: PropTypes.array,
  SID: PropTypes.string,
  workloads: PropTypes.array,
};

export default PathwaySystems;
