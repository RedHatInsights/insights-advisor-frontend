import './_Export.scss';

import React, { useContext, useState } from 'react';
import { Button } from '@patternfly/react-core';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { workloadQueryBuilder } from '../Common/Tables';
import { exportNotifications } from '../../AppConstants';
import { useDispatch } from 'react-redux';
import { addNotification } from '@redhat-cloud-services/frontend-components-notifications/redux/actions/notifications';
import { EnvironmentContext } from '../../App';

const NewSystemsPdf = ({ filters }) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const selectedTags = useSelector(
    ({ AdvisorStore }) => AdvisorStore?.selectedTags,
  );
  const workloads = useSelector(({ AdvisorStore }) => AdvisorStore?.workloads);
  const SID = useSelector(({ AdvisorStore }) => AdvisorStore?.SID);
  const envContext = useContext(EnvironmentContext);

  const dataFetch = async () => {
    setLoading(true);
    dispatch(addNotification(exportNotifications.pending));

    let options = selectedTags?.length && { tags: selectedTags };
    workloads &&
      (options = { ...options, ...workloadQueryBuilder(workloads, SID) });
    try {
      await envContext.requestPdf({
        filename: `Advisor_systems--${new Date()
          .toUTCString()
          .replace(/ /g, '-')}.pdf`,
        payload: {
          manifestLocation: '/apps/advisor/fed-mods.json',
          scope: 'advisor',
          module: './NewSystemsPdfBuild',
          fetchDataParams: {
            filters,
            options,
            selectedTags,
          },
        },
      });

      dispatch(addNotification(exportNotifications.success));
    } catch (e) {
      dispatch(addNotification(exportNotifications.error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={dataFetch}
      variant="button"
      isDisabled={loading}
      className="pf-v5-c-menu__item adv-c-dropdown-systems-pdf__menu-item"
    >
      Export to PDF
    </Button>
  );
};

NewSystemsPdf.propTypes = {
  filters: PropTypes.object,
  systemsCount: PropTypes.number,
};

export default NewSystemsPdf;
