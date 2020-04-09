import './_Download.scss';

import { RULES_FETCH_URL, STATS_REPORTS_FETCH_URL, STATS_SYSTEMS_FETCH_URL } from '../../AppConstants';

import API from '../../Utilities/Api';
import { DownloadButton } from '@redhat-cloud-services/frontend-components-pdf-generator';
import ExportIcon from '@patternfly/react-icons/dist/js/icons/export-icon';
import React from 'react';
import buildExecReport from './Build';
import messages from '../../Messages';
import { useIntl } from 'react-intl';

const DownloadExecReport = () => {
    const intl = useIntl();
    const [loading, setLoading] = React.useState(false);

    const dataFetch = async () => {
        setLoading(true);
        const [statsSystems, statsReports, topActiveRec] = await Promise.all([
            (await API.get(STATS_SYSTEMS_FETCH_URL)).data,
            (await API.get(STATS_REPORTS_FETCH_URL)).data,
            (await API.get(RULES_FETCH_URL, {}, { limit: 3, sort: '-impacted_count' })).data
        ]);
        const report = buildExecReport({ statsReports, statsSystems, topActiveRec, intl });
        setLoading(false);

        return [report];
    };

    return <DownloadButton
        label={loading ? intl.formatMessage(messages.loading) : intl.formatMessage(messages.downloadExecutiveLabel)}
        asyncFunction={dataFetch}
        buttonProps={{ variant: 'link', icon: <ExportIcon className='iconOverride' />, component: 'a', className: 'downloadButtonOverride' }}
        type={intl.formatMessage(messages.insightsHeader)}
        fileName={`Insights-Executive-Report--${(new Date()).toUTCString().replace(/ /g, '-')}.pdf`} />;
};

export default DownloadExecReport;
