import './_Download.scss';
import React, { useContext, useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { addNotification } from '@redhat-cloud-services/frontend-components-notifications/redux/actions/notifications';

import { ExportIcon } from '@patternfly/react-icons';
import messages from '../../Messages';
import { useIntl } from 'react-intl';
import { Button } from '@patternfly/react-core';
import { exportNotifications } from '../../AppConstants';
import { EnvironmentContext } from '../../App';

const DownloadExecReport = ({ isDisabled }) => {
  const intl = useIntl();
  const dispatch = useDispatch();
  const envContext = useContext(EnvironmentContext);
  const [loading, setLoading] = useState(false);

  const dataFetch = async () => {
    setLoading(true);
    dispatch(addNotification(exportNotifications.pending));

    try {
      await envContext.requestPdf({
        filename: `Advisor-Executive-Report--${new Date()
          .toUTCString()
          .replace(/ /g, '-')}.pdf`,
        payload: {
          manifestLocation: '/apps/advisor/fed-mods.json',
          scope: 'advisor',
          module: './BuildExecReport',
          fetchDataParams: {
            limit: 3,
            sort: '-total_risk,-impacted_count',
            impacting: true,
          },
        },
      });

      setLoading(false);
      dispatch(addNotification(exportNotifications.success));
    } catch (error) {
      void error;
      setLoading(false);
      dispatch(addNotification(exportNotifications.error));
    }
  };

  return (
    <Button
      onClick={dataFetch}
      variant="link"
      isInline
      isDisabled={isDisabled || loading}
      icon={<ExportIcon className="iconOverride" />}
      className="downloadButtonOverride"
      aria-label="Download Exec Report"
    >
      {intl.formatMessage(messages.downloadExecutiveLabel)}
    </Button>
  );
};

DownloadExecReport.propTypes = {
  isDisabled: PropTypes.bool,
};

export default DownloadExecReport;
