/* eslint-disable camelcase */
import { Column, Section, Table } from '@redhat-cloud-services/frontend-components-pdf-generator';

import PropTypes from 'prop-types';
import React from 'react';
import { Text } from '@react-pdf/renderer';
import messages from '../../Messages';

export const tablePage = ({ page, systems, intl }) => {
    const rowHeaders = [intl.formatMessage(messages.name), intl.formatMessage(messages.recommendations), intl.formatMessage(messages.critical),
        intl.formatMessage(messages.important), intl.formatMessage(messages.moderate), intl.formatMessage(messages.low),
        intl.formatMessage(messages.lastSeen)];
    const rows = [
        ...systems.map(system => [system.display_name, `${system.hits}`, `${system.critical_hits}`, `${system.important_hits}`,
            `${system.moderate_hits}`, `${system.low_hits}`, new Date(system.last_seen).toUTCString()
        ])];

    return <React.Fragment key={page}>
        <Column>
            <Table withHeader rows={[rowHeaders, ...rows]} />
        </Column>
    </React.Fragment >;
};

tablePage.propTypes = {
    systems: PropTypes.object,
    page: PropTypes.number,
    intl: PropTypes.any
};

export const leadPage = ({ systemsTotal, systems, filters, tags, intl }) => {
    return <React.Fragment key={`${intl.formatMessage(messages.insightsHeader)}: ${intl.formatMessage(messages.systems)}`}>
        <Text key='sys-count'>
            {intl.formatMessage(messages.sysTableCount, {
                systems: <Text style={{ fontWeight: 700 }}>
                    {intl.formatMessage(messages.execReportHeaderSystems, { systems: systemsTotal })}
                </Text>
            })}
        </Text>
        <Text key='filters-applied'>
            {intl.formatMessage(messages.filtersApplied)}
        </Text>
        <Text>
            {Object.entries(filters).map(value => <Text key={value}>{`${value[0]}: ${value[1]} `}</Text>)}
        </Text>
        <Text key='tags-applied'>
            {intl.formatMessage(messages.tagsApplied)}
        </Text>
        <Text>{tags ? decodeURIComponent(tags) : intl.formatMessage(messages.noTags)}</Text>
        <Section title='Systems'>
            {tablePage({ systems, intl })}
        </Section>
    </React.Fragment >;
};

leadPage.propTypes = {
    systems: PropTypes.object,
    systemsTotal: PropTypes.number,
    filters: PropTypes.object,
    tags: PropTypes.array,
    intl: PropTypes.any
};
