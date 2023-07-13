import './_Download.scss';
import React from 'react';
import PropTypes from 'prop-types';
import ExportIcon from '@patternfly/react-icons/dist/esm/icons/export-icon';
import messages from '../../Messages';
import { useIntl } from 'react-intl';
import { Button } from '@patternfly/react-core';
import usePDFExport from '@redhat-cloud-services/frontend-components-utilities/useExportPDF/useExportPDF';
import { useDispatch } from 'react-redux';

const DownloadExecReport = ({ isDisabled }) => {
  const intl = useIntl();
  const dispatch = useDispatch();
  const downloadReport = usePDFExport('advisor', dispatch);
  const fileName = `Advisor-Executive-Report--${new Date()
    .toUTCString()
    .replace(/ /g, '-')}.pdf`;

  const downloadPDFReport = () => {
    downloadReport('advisor', fileName);
  };

  return (
    <Button
      onClick={downloadPDFReport}
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
