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
    text: { marginTop: global_spacer_md.value  }
});

export const tablePage = ({ page, systems, intl }) => {
    const rowHeaders = [intl.formatMessage(messages.name), intl.formatMessage(messages.recommendations), intl.formatMessage(messages.critical),
        intl.formatMessage(messages.important), intl.formatMessage(messages.moderate), intl.formatMessage(messages.low),
        intl.formatMessage(messages.lastSeen)];
    const rows = [
        ...systems.map(system => [
            <Link key={system.system_uuid} style={styles.link}
                src={`https://cloud.redhat.com/insights/advisor/systems/${system.system_uuid}/`}>system.display_name</Link>,
            `${system.hits}`, `${system.critical_hits}`, `${system.important_hits}`, `${system.moderate_hits}`, `${system.low_hits}`,
            new Date(system.last_seen).toUTCString()
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
