import React from 'react';
import PropTypes from 'prop-types';
import Inventory from '../../../PresentationalComponents/Inventory/Inventory';

const PathwaySystems = ({ pathway, selectedTags, workloads }) => (
  <Inventory
    tableProps={{
      canSelectAll: false,
      isStickyHeader: true,
    }}
    pathway={pathway}
    selectedTags={selectedTags}
    workloads={workloads}
    showTags
  />
);

PathwaySystems.propTypes = {
  pathway: PropTypes.object,
  selectedTags: PropTypes.array,
  workloads: PropTypes.array,
};

export default PathwaySystems;
