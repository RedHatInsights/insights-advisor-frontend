import './_Export.scss';

import React, { useMemo, useState } from 'react';
import { leadPage, tablePage } from './SystemsPdfBuild';

import API from '../../Utilities/Api';
import { DownloadButton } from '@redhat-cloud-services/frontend-components-pdf-generator';
import PropTypes from 'prop-types';
import { SYSTEMS_FETCH_URL } from '../../AppConstants';
import messages from '../../Messages';
import { useIntl } from 'react-intl';

const SystemsPdf = ({ filters, selectedTags, systemsCount }) => {
    const intl = useIntl();
    const [loading, setLoading] = useState(false);

    const dataFetch = async () => {
        setLoading(true);
        const options = selectedTags.length && ({ tags: selectedTags });
        const [systems] = await Promise.all([(await API.get(SYSTEMS_FETCH_URL, {}, { ...filters, ...options, limit: systemsCount })).data]);
        const firstPage = leadPage({ systemsTotal: systems.meta.count, systems: systems.data.slice(0, 18), filters, tags: selectedTags, intl });

        const otherPages = systems.data.slice(18, systems.data.length).reduce((resultArray, item, index) => {
            const chunkIndex = Math.floor(index / 31);
            !resultArray[chunkIndex] && (resultArray[chunkIndex] = []);
            resultArray[chunkIndex].push(item);

            return resultArray;
        }, []);

        setLoading(false);

        return [firstPage, ...otherPages.map((pageSystems, index) => tablePage({ page: index, systems: pageSystems, intl }))];
    };

    return useMemo(() => {
        return <DownloadButton
            allPagesHaveTitle={false}
            label={loading ? intl.formatMessage(messages.loading) : intl.formatMessage(messages.exportPdf)}
            asyncFunction={dataFetch}
            buttonProps={{
                variant: '', component: 'button', className: 'pf-c-dropdown__menu-item systemsPdfOverride', ...(loading ? { isDisabled: true } : null)
            }}
            reportName={`${intl.formatMessage(messages.insightsHeader)}:`}
            type={intl.formatMessage(messages.systems)}
            fileName={`Advisor_systems--${(new Date()).toUTCString().replace(/ /g, '-')}.pdf`}
            size={[841.89, 595.28]}
        />;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [loading]);
};

SystemsPdf.propTypes = {
    filters: PropTypes.object,
    selectedTags: PropTypes.string,
    systemsCount: PropTypes.number
};

export default SystemsPdf;
