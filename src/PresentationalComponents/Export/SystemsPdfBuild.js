/* eslint-disable camelcase */
import { Column, Paragraph, Section, Table } from '@redhat-cloud-services/frontend-components-pdf-generator';

import PropTypes from 'prop-types';
import React from 'react';
import { Text } from '@react-pdf/renderer';
import messages from '../../Messages';

export const tablePage = ({ systems, intl }) => {
    const rowHeaders = [intl.formatMessage(messages.name), intl.formatMessage(messages.totalRecs), intl.formatMessage(messages.critical),
        intl.formatMessage(messages.important), intl.formatMessage(messages.moderate), intl.formatMessage(messages.low),
        intl.formatMessage(messages.lastSeen)];
    const rows = [
        ...systems.data.map(system => [system.display_name, `${system.hits}`, `${system.critical_hits}`, `${system.important_hits}`,
            `${system.moderate_hits}`, `${system.low_hits}`, new Date(system.last_seen).toUTCString()
        ])];

    return <React.Fragment key='test'>
        <Column>
            <Table withHeader rows={[rowHeaders, ...rows]} />
        </Column>
    </React.Fragment >;
};

tablePage.propTypes = {
    systems: PropTypes.object,
    intl: PropTypes.any
};

export const leadPage = ({ systems, filters, tags, intl }) => {

    return <React.Fragment key={`${intl.formatMessage(messages.insightsHeader)}: ${intl.formatMessage(messages.systems)}`}>
        <Paragraph key='sys-count'>
            {intl.formatMessage(messages.sysTableCount, {
                systems: <Text style={{ fontWeight: 700 }}>
                    {intl.formatMessage(messages.execReportHeaderSystems, { systems: systems.meta.count })}
                </Text>
            })}
        </Paragraph>
        <Paragraph key='filters-applied'>
            {intl.formatMessage(messages.filtersApplied)}
            {/* <Text>{filters}</Text> */}
        </Paragraph>
        <Paragraph key='tags-applied'>
            {intl.formatMessage(messages.tagsApplied)}
            <Text>{decodeURIComponent(tags)}</Text>
        </Paragraph>
        <Section title='Systems'>
            {tablePage({ systems, intl })}
        </Section>
    </React.Fragment >;
};

leadPage.propTypes = {
    systems: PropTypes.object,
    filters: PropTypes.object,
    tags: PropTypes.array,
    intl: PropTypes.any
};
