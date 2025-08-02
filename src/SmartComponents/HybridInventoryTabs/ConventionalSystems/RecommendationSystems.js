import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import Inventory from '../../../PresentationalComponents/Inventory/Inventory';
import { useSelector } from 'react-redux';
import { useActionResolver } from '../helpers';
import { EnvironmentContext } from '../../../App';

const ConventionalSystems = ({
  rule,
  afterDisableFn,
  handleModalToggle,
  axios,
  ...props
}) => {
  const selectedTags = useSelector(({ filters }) => filters.selectedTags);
  const workloads = useSelector(({ filters }) => filters.workloads);
  const SID = useSelector(({ filters }) => filters.SID);
  const envContext = useContext(EnvironmentContext);
  const actionResolver = useActionResolver(
    handleModalToggle,
    !envContext.isDisableRecEnabled,
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
      axios={axios}
      IopRemediationModal={props.props.IopRemediationModal}
    />
  );
};

ConventionalSystems.propTypes = {
  rule: PropTypes.object,
  afterDisableFn: PropTypes.func,
  handleModalToggle: PropTypes.func,
  axios: PropTypes.func,
  props: {
    IopRemediationModal: PropTypes.element,
  },
};
export default ConventionalSystems;
