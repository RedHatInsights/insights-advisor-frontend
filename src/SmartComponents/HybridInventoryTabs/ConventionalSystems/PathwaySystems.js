import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import Inventory from '../../../PresentationalComponents/Inventory/Inventory';

const PathwaySystems = ({ pathway, selectedTags, workloads, SID }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    return () => {
      dispatch({
        type: 'CLEAR_INVENTORY_STORE',
        payload: [],
      });
    };
  }, [dispatch]);

  return (
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
};

PathwaySystems.propTypes = {
  pathway: PropTypes.object,
  selectedTags: PropTypes.array,
  SID: PropTypes.string,
  workloads: PropTypes.array,
};

export default PathwaySystems;
