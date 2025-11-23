import { StyleSheet } from '@react-pdf/renderer';

import {
  BASE_URL,
  DUE_TO,
  EXEC_REPORT_HEADER_SYSTEMS,
  FILTERS_APPLIED,
  INSIGHTS_HEADER,
  NO_TAGS,
  SYSCOUNT,
  SYSTEMS,
  TAGS_APPLIED,
} from '../../AppConstants';
import PropTypes from 'prop-types';
import React from 'react';
import {
  global_text_color_default,
  t_global_font_weight_heading_bold,
  t_global_spacer_md,
  t_global_spacer_sm,
  t_global_text_color_link_default,
  t_global_text_color_status_danger_default,
} from '@patternfly/react-tokens';

import TablePage from './TablePage';

const styles = StyleSheet.create({
  bold: { fontWeight: t_global_font_weight_heading_bold.value },
  link: { color: t_global_text_color_link_default.value },
  text: { fontSize: 12 },
  textMargin: { marginTop: t_global_spacer_md.value },
  nameColumn: {
    width: '10px',
    fontSize: 8,
    paddingTop: '1px',
    paddingBottom: '1px',
  },
  document: {
    paddingTop: '24px',
    paddingLeft: '32px',
    paddingRight: '32px',
  },
  header: {
    fontSize: 12,
    color: global_text_color_default.value,
    paddingLeft: t_global_spacer_md.value,
    paddingBottom: t_global_spacer_sm.value,
    paddingTop: t_global_spacer_sm.value,
  },
  row: {
    fontSize: 8,
    paddingTop: '1px',
    paddingBottom: '1px',
    width: '10px',
    textAlign: 'center',
  },
  lastSeenRow: { width: '90px' },
});

export const fetchData = async (createAsyncRequest, options) => {
  const systems = createAsyncRequest('advisor-backend', {
    method: 'GET',
    url: `${BASE_URL}/export/systems/`,
    params: {
      filters: options.filters,
      ...options,
    },
  });

  const data = await Promise.all([systems]);
  return { data: data[0], options };
};

const SystemsPdfBuild = ({ asyncData, additionalData }) => {
  const isLightspeedEnabled = additionalData.isLightspeedEnabled;
  const { data, options } = asyncData.data;
  const filters = {
    sort: '-last_seen',
    limit: '20',
    offset: '0',
    hits: 'all',
  };

  return (
    <div style={styles.document}>
      <span
        style={{
          fontSize: '24px',
          color: t_global_text_color_status_danger_default.value,
        }}
      >
        Red Hat {isLightspeedEnabled ? 'Lightspeed' : 'Insights'}
      </span>
      <br />
      <span
        style={{
          fontSize: '32px',
          color: t_global_text_color_status_danger_default.value,
        }}
      >
        {`${INSIGHTS_HEADER}: ${SYSTEMS}`}
      </span>
      <div key="sys-count" style={{ ...styles.text, ...styles.textMargin }}>
        {SYSCOUNT}
        <span key="sys-count-count" style={{ ...styles.bold, ...styles.text }}>
          {EXEC_REPORT_HEADER_SYSTEMS(data.length)}
          {data.length > 1000 && DUE_TO}
        </span>
      </div>
      <div key="sys-filters" style={{ ...styles.text, ...styles.textMargin }}>
        {FILTERS_APPLIED}
      </div>
      <div key="sys-filters-values" style={{ ...styles.bold, ...styles.text }}>
        {Object.entries(filters).map((value) => {
          return <span key={value}>{`${value[0]}: ${value[1]}     `}</span>;
        })}
      </div>
      <div key="sys-tags" style={{ ...styles.text, ...styles.textMargin }}>
        {TAGS_APPLIED}
      </div>
      <div key="sys-tags-values" style={{ ...styles.bold, ...styles.text }}>
        {options.selectedTags
          ? decodeURIComponent(options.selectedTags)
          : NO_TAGS}
      </div>
      <div>
        <TablePage systems={data} styles={styles} />
      </div>
    </div>
  );
};

SystemsPdfBuild.propTypes = {
  asyncData: PropTypes.object,
  additionalData: PropTypes.object,
};

export default SystemsPdfBuild;
