/* eslint-disable camelcase */
import { Column, Section, Table } from '@redhat-cloud-services/frontend-components-pdf-generator';
import { Link, StyleSheet, Text } from '@react-pdf/renderer';

import PropTypes from 'prop-types';
import React from 'react';
import global_FontWeight_bold from '@patternfly/react-tokens/dist/js/global_FontWeight_bold';
import global_link_Color from '@patternfly/react-tokens/dist/js/global_link_Color';
import global_spacer_md from '@patternfly/react-tokens/dist/js/global_spacer_md';
import messages from '../../Messages';

const styles = StyleSheet.create({
    bold: { fontWeight: global_FontWeight_bold.value },
    link: { color: global_link_Color.value },
    text: { marginTop: global_spacer_md.value },
    endColumn: { width: '100px' },
    hitColumn: { width: '4px' }
});

export const tablePage = ({ page, systems, intl }) => {
    const header = [{ value: intl.formatMessage(messages.name), style: styles.endColumn },
        { value: intl.formatMessage(messages.recommendations), style: styles.hitColumn },
        { value: intl.formatMessage(messages.critical), style: styles.hitColumn },
        { value: intl.formatMessage(messages.important), style: styles.hitColumn },
        { value: intl.formatMessage(messages.moderate), style: styles.hitColumn },
        { value: intl.formatMessage(messages.low), style: styles.hitColumn },
        { value: intl.formatMessage(messages.lastSeen), style: styles.endColumn }];
    const hitColumns = ['hits', 'critical_hits', 'important_hits', 'moderate_hits', 'low_hits'];

    // eslint-disable-next-line react/prop-types
    const rowBuilder = ({ value, style }) => <Text style={style}>{value}</Text>;
    const rows = [
        ...systems.map(system => {
            const [, date, month, year, time] = new Date(system.last_seen).toUTCString().split(' ');
            const sysDate = `${date} ${month} ${year}, ${time.split(':').slice(0, 2).join(':')} UTC`;
            return [
                <Text key={system.system_uuid} style={styles.endColumn}><Link style={styles.link}
                    src={`https://cloud.redhat.com/insights/advisor/systems/${system.system_uuid}/`}>{system.display_name}</Link></Text>,
                ...hitColumns.map(item => rowBuilder({ style: styles.hitColumn, value: system[item] })),
                <Text key={system.last_seen} style={styles.endColumn}>{`${sysDate}`}</Text>
            ];
        })];

    return <React.Fragment key={page}>
        <Column>
            <Table withHeader rows={[header.map(item => rowBuilder(item)), ...rows]} />
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
        <Text key='sys-count' style={styles.text}>
            {intl.formatMessage(messages.sysTableCount, {
                systems: <Text key='sys-count-count' style={styles.bold}>
                    {intl.formatMessage(messages.execReportHeaderSystems, { systems: systemsTotal })}
                </Text>
            })}
        </Text>
        <Text key='sys-filters' style={styles.text}>
            {intl.formatMessage(messages.filtersApplied)}
        </Text>
        <Text key='sys-filters-values' style={styles.bold}>
            {Object.entries(filters).map(value => <Text key={value}>{`${value[0]}: ${value[1]} `}</Text>)}
        </Text>
        <Text key='sys-tags' style={styles.text}>
            {intl.formatMessage(messages.tagsApplied)}
        </Text>
        <Text key='sys-tags-values' style={styles.bold}>{tags ? decodeURIComponent(tags) : intl.formatMessage(messages.noTags)}</Text>
        <Section key='systems' title='Systems'>
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
