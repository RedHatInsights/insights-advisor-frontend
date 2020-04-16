import './_Download.scss';

import { RULES_FETCH_URL, STATS_REPORTS_FETCH_URL, STATS_SYSTEMS_FETCH_URL } from '../../AppConstants';
import React, { useMemo, useState } from 'react';

import API from '../../Utilities/Api';
import { DownloadButton } from '@redhat-cloud-services/frontend-components-pdf-generator';
import ExportIcon from '@patternfly/react-icons/dist/js/icons/export-icon';
import buildExecReport from './Build';
import messages from '../../Messages';
import { useIntl } from 'react-intl';

const DownloadExecReport = () => {
    const intl = useIntl();
    const [loading, setLoading] = useState(false);

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

    return useMemo(() => {
        return <DownloadButton
            label={loading ? intl.formatMessage(messages.loading) : intl.formatMessage(messages.downloadExecutiveLabel)}
            asyncFunction={dataFetch}
            buttonProps={{
                variant: 'link', icon: <ExportIcon className='iconOverride' />, component: 'a', className: 'downloadButtonOverride',
                ...(loading ? { isDisabled: true } : null)
            }}
            type={intl.formatMessage(messages.insightsHeader)}
            fileName={`Insights-Executive-Report--${(new Date()).toUTCString().replace(/ /g, '-')}.pdf`} />;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [loading]);
};

export default DownloadExecReport;
