import './_Export.scss';

import React, { useContext, useState } from 'react';
import { Button } from '@patternfly/react-core';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { workloadQueryBuilder } from '../Common/Tables';
import { exportNotifications } from '../../AppConstants';
import { EnvironmentContext } from '../../App';
import { useAddNotification } from '@redhat-cloud-services/frontend-components-notifications';

const SystemsPdf = ({ filters }) => {
  const [loading, setLoading] = useState(false);
  const selectedTags = useSelector(
    ({ AdvisorStore }) => AdvisorStore?.selectedTags,
  );
  const workloads = useSelector(({ AdvisorStore }) => AdvisorStore?.workloads);
  const envContext = useContext(EnvironmentContext);
  const addNotification = useAddNotification();
  const dataFetch = async () => {
    setLoading(true);
    addNotification(exportNotifications.pending);

    let options = selectedTags?.length && { tags: selectedTags };
    workloads && (options = { ...options, ...workloadQueryBuilder(workloads) });
    try {
      await envContext.requestPdf({
        filename: `Advisor_systems--${new Date()
          .toUTCString()
          .replace(/ /g, '-')}.pdf`,
        payload: {
          manifestLocation: '/apps/advisor/fed-mods.json',
          scope: 'advisor',
          module: './SystemsPdfBuild',
          fetchDataParams: {
            filters,
            options,
            selectedTags,
          },
          additionalData: {
            isLightspeedEnabled: envContext.isLightspeedEnabled,
          },
        },
      });

      addNotification(exportNotifications.success);
    } catch (error) {
      void error;
      addNotification(exportNotifications.error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={dataFetch}
      variant="plain"
      isDisabled={loading || !envContext.isExportEnabled}
      className="pf-v6-c-menu__item adv-c-dropdown-systems-pdf__menu-item"
    >
      Export to PDF
    </Button>
  );
};

SystemsPdf.propTypes = {
  filters: PropTypes.object,
  systemsCount: PropTypes.number,
};

export default SystemsPdf;
