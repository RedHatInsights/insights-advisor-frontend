import './_Download.scss';
import React from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { addNotification } from '@redhat-cloud-services/frontend-components-notifications/redux/actions/notifications';
import ExportIcon from '@patternfly/react-icons/dist/esm/icons/export-icon';
import messages from '../../Messages';
import { useIntl } from 'react-intl';
import { Button } from '@patternfly/react-core';
import { fetchPDFReport } from '../../Utilities/Api';
import { renderPDF } from '../../Utilities/Helpers';
import { exportNotifications } from '../../AppConstants';

const DownloadExecReport = ({ isDisabled }) => {
  const intl = useIntl();
  const dispatch = useDispatch();

  const dataFetch = async () => {
    dispatch(addNotification(exportNotifications.pending));

    try {
      const result = await fetchPDFReport('advisor');
      renderPDF(
        result,
        `Advisor-Executive-Report--${new Date()
          .toUTCString()
          .replace(/ /g, '-')}.pdf`
      );
      dispatch(addNotification(exportNotifications.success));
    } catch (e) {
      dispatch(addNotification(exportNotifications.error));
    }
  };

  return (
    <Button
      onClick={dataFetch}
      variant="link"
      isInline
      isDisabled={isDisabled}
      icon={<ExportIcon className="iconOverride" />}
      className="downloadButtonOverride"
    >
      {intl.formatMessage(messages.downloadExecutiveLabel)}
    </Button>
  );
};

DownloadExecReport.propTypes = {
  isDisabled: PropTypes.bool,
};
export default DownloadExecReport;
