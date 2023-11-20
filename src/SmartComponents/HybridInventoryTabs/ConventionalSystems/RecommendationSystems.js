import React from 'react';
import PropTypes from 'prop-types';
import { usePermissions } from '@redhat-cloud-services/frontend-components-utilities/RBACHook';
import Inventory from '../../../PresentationalComponents/Inventory/Inventory';
import { useSelector } from 'react-redux';
import { PERMS } from '../../../AppConstants';
import { useActionResolver } from '../helpers';

const ConventionalSystems = ({ rule, afterDisableFn, handleModalToggle }) => {
  const selectedTags = useSelector(({ filters }) => filters.selectedTags);
  const workloads = useSelector(({ filters }) => filters.workloads);
  const SID = useSelector(({ filters }) => filters.SID);
  const permsExport = usePermissions('advisor', PERMS.export).hasAccess;

  const actionResolver = useActionResolver(handleModalToggle);

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
      permsExport={permsExport}
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
