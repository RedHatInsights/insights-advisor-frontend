import React from 'react';
import PropTypes from 'prop-types';
import Inventory from '../../../PresentationalComponents/Inventory/Inventory';

const PathwaySystems = ({
  pathway,
  selectedTags,
  selectedGroups,
  workloads,
  axios,
}) => (
  <Inventory
    tableProps={{
      canSelectAll: false,
      isStickyHeader: true,
    }}
    pathway={pathway}
    selectedTags={selectedTags}
    selectedGroups={selectedGroups}
    workloads={workloads}
    showTags
    axios={axios}
  />
);

PathwaySystems.propTypes = {
  pathway: PropTypes.object,
  selectedTags: PropTypes.array,
  selectedGroups: PropTypes.array,
  workloads: PropTypes.array,
  axios: PropTypes.func,
};

export default PathwaySystems;
