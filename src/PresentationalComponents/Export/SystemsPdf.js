import './_Export.scss';

import React, { useMemo, useState } from 'react';

import API from '../../Utilities/Api';
import { DownloadButton } from '@redhat-cloud-services/frontend-components-pdf-generator';
import PropTypes from 'prop-types';
import { SYSTEMS_FETCH_URL } from '../../AppConstants';
import buildReport from './SystemsPdfBuild';
import messages from '../../Messages';
import { useIntl } from 'react-intl';

const SystemsPdf = ({ filters, selectedTags, systemsCount }) => {
    const intl = useIntl();
    const [loading, setLoading] = useState(false);

    const dataFetch = async () => {
        setLoading(true);
        const options = selectedTags.length && ({ tags: selectedTags });
        const [systems] = await Promise.all([
            (await API.get(SYSTEMS_FETCH_URL, {}, { ...filters, ...options, limit: systemsCount })).data
        ]);
        const report = buildReport({ systems, filters, intl });
        setLoading(false);

        return [report];
    };

    return useMemo(() => {
        return <DownloadButton
            label={loading ? intl.formatMessage(messages.loading) : intl.formatMessage(messages.exportPdf)}
            asyncFunction={dataFetch}
            buttonProps={{
                variant: '', component: 'button', className: 'pf-c-dropdown__menu-item systemsPdfOverride', ...(loading ? { isDisabled: true } : null)
            }}
            reportName={`${intl.formatMessage(messages.insightsHeader)}:`}
            type={intl.formatMessage(messages.systems)}
            fileName={`Advisor_systems--${(new Date()).toUTCString().replace(/ /g, '-')}.pdf`} />;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [loading]);
};

SystemsPdf.propTypes = {
    filters: PropTypes.object,
    selectedTags: PropTypes.string,
    systemsCount: PropTypes.number
};

export default SystemsPdf;
