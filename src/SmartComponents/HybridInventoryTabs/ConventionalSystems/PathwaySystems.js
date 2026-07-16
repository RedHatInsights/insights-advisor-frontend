import React from 'react';
import PropTypes from 'prop-types';
import Inventory from '../../../PresentationalComponents/Inventory/Inventory';

const PathwaySystems = ({ pathway, selectedTags, workloads, axios, IopRemediationModal }) => {
  return (
  <Inventory
    tableProps={{
      canSelectAll: false,
      isStickyHeader: true,
    }}
    pathway={pathway}
    selectedTags={selectedTags}
    workloads={workloads}
    showTags
    axios={axios}
    IopRemediationModal={IopRemediationModal}
  />
  );
};

PathwaySystems.propTypes = {
  pathway: PropTypes.object,
  selectedTags: PropTypes.array,
  workloads: PropTypes.array,
  axios: PropTypes.object,
  IopRemediationModal: PropTypes.element,
};

export default PathwaySystems;
