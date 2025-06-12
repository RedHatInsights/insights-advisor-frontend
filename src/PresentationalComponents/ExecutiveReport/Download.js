import './_Download.scss';
import PropTypes from 'prop-types';
import {
  INSIGHTS_HEADER,
  RULES_FETCH_URL,
  STATS_REPORTS_FETCH_URL,
  STATS_SYSTEMS_FETCH_URL,
  exportNotifications,
} from '../../AppConstants';
import React, { useState } from 'react';
import { DownloadButton } from '@redhat-cloud-services/frontend-components-pdf-generator';
import { addNotification } from '@redhat-cloud-services/frontend-components-notifications/redux/actions/notifications';
import { Get } from '../../Utilities/Api';
import messages from '../../Messages';
import { useIntl } from 'react-intl';
import { useDispatch } from 'react-redux';
import { ExportIcon } from '@patternfly/react-icons';
import { populateExportError } from '../helper';
import BuildExecReport from './BuildExecReport';

const DownloadExecReport = ({ isDisabled }) => {
  const intl = useIntl();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  const dataFetch = async () => {
    setLoading(true);
    dispatch(addNotification(exportNotifications.pending));

    try {
      const [statsSystems, statsReports, topActiveRec] = (
        await Promise.all([
          Get(STATS_SYSTEMS_FETCH_URL),
          Get(STATS_REPORTS_FETCH_URL),
          Get(
            RULES_FETCH_URL,
            {},
            { limit: 3, sort: '-total_risk,-impacted_count', impacting: true },
          ),
        ])
      ).map(({ data }) => data);

      const report = (
        <BuildExecReport
          statsReports={statsReports}
          statsSystems={statsSystems}
          topActiveRec={topActiveRec}
          intl={intl}
        />
      );

      setLoading(false);

      dispatch(addNotification(exportNotifications.success));

      return [report];
    } catch (e) {
      setLoading(false);
      dispatch(addNotification(populateExportError(e)));

      return [];
    }
  };

  return (
    <DownloadButton
      fallback={<div />}
      groupName={intl.formatMessage(messages.redHatInsights)}
      label={
        loading
          ? intl.formatMessage(messages.loading)
          : intl.formatMessage(messages.downloadExecutiveLabel)
      }
      asyncFunction={dataFetch}
      buttonProps={{
        variant: 'link',
        icon: <ExportIcon className="iconOverride" />,
        component: 'a',
        className: 'downloadButtonOverride',
        isAriaDisabled: isDisabled,
        ...(loading ? { isDisabled: true } : null),
      }}
      type={INSIGHTS_HEADER}
      fileName={`Advisor-Executive-Report--${new Date()
        .toUTCString()
        .replace(/ /g, '-')}.pdf`}
    />
  );
};

DownloadExecReport.propTypes = {
  isDisabled: PropTypes.bool,
};

export default DownloadExecReport;
