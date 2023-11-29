import './_Download.scss';

import {
  RULES_FETCH_URL,
  STATS_REPORTS_FETCH_URL,
  STATS_SYSTEMS_FETCH_URL,
  exportNotifications,
} from '../../AppConstants';
import React, { useMemo, useState } from 'react';

import { DownloadButtonWrapper } from '@redhat-cloud-services/frontend-components-pdf-generator/dist/esm/index';
import { addNotification } from '@redhat-cloud-services/frontend-components-notifications/redux/actions/notifications';
import ExportIcon from '@patternfly/react-icons/dist/esm/icons/export-icon';
import { Get } from '../../Utilities/Api';
import messages from '../../Messages';
import { useIntl } from 'react-intl';
import { useDispatch } from 'react-redux';

const DownloadExecReport = ({ isDisabled }) => {
  const intl = useIntl();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  const dataFetch = async () => {
    setLoading(true);
    const { BuildExecReport } = await import(
      /* webpackChunkName: 'BuildExecReport' */ './BuildExecReport'
    );
    dispatch(addNotification(exportNotifications.pending));

    try {
      const [statsSystems, statsReports, topActiveRec] = await Promise.all([
        (await Get(STATS_SYSTEMS_FETCH_URL)).data,
        (await Get(STATS_REPORTS_FETCH_URL)).data,
        (
          await Get(
            RULES_FETCH_URL,
            {},
            { limit: 3, sort: '-total_risk,-impacted_count', impacting: true }
          )
        ).data,
      ]);

      const report = BuildExecReport({
        statsReports,
        statsSystems,
        topActiveRec,
        intl,
      });
      setLoading(false);
      dispatch(addNotification(exportNotifications.success));

      return [report];
    } catch (e) {
      setLoading(false);
      dispatch(addNotification(exportNotifications.error));

      return [];
    }
  };

  return useMemo(() => {
    return (
      <DownloadButtonWrapper
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
        type={intl.formatMessage(messages.insightsHeader)}
        fileName={`Advisor-Executive-Report--${new Date()
          .toUTCString()
          .replace(/ /g, '-')}.pdf`}
      />
    );
  }, [loading]);
};

export default DownloadExecReport;
