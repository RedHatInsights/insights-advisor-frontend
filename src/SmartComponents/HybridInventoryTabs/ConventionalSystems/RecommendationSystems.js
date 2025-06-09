import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import Inventory from '../../../PresentationalComponents/Inventory/Inventory';
import { useSelector } from 'react-redux';
import { useActionResolver } from '../helpers';
import { EnvironmentContext } from '../../../App';

const ConventionalSystems = ({ rule, afterDisableFn, handleModalToggle }) => {
  const selectedTags = useSelector(({ filters }) => filters.selectedTags);
  const workloads = useSelector(({ filters }) => filters.workloads);
  const SID = useSelector(({ filters }) => filters.SID);
  const envContext = useContext(EnvironmentContext);
  const actionResolver = useActionResolver(
    handleModalToggle,
    !envContext.isDisableRecEnabled
  );

  return (
    <Inventory
      tableProps={{
        canSelectAll: false,
        actionResolver,
        isStickyHeader: true,
      }}
      rule={rule}
      afterDisableFn={afterDisableFn}
      selectedTags={selectedTags}
      workloads={workloads}
      SID={SID}
      permsExport={envContext.isExportEnabled}
      exportTable="systems"
      showTags={true}
    />
  );
};

ConventionalSystems.propTypes = {
  rule: PropTypes.object,
  afterDisableFn: PropTypes.func,
  handleModalToggle: PropTypes.func,
};
export default ConventionalSystems;
