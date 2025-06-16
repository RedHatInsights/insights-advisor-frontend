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
  c_table_m_compact_cell_PaddingBottom,
  c_table_m_compact_cell_PaddingLeft,
  c_table_m_compact_cell_PaddingTop,
  chart_global_Fill_Color_700,
  global_FontWeight_bold,
  global_link_Color,
  global_spacer_md,
} from '@patternfly/react-tokens';
import TablePage from './TablePage';
import chart_color_red_100 from '@patternfly/react-tokens/dist/js/chart_color_red_100';

const styles = StyleSheet.create({
  bold: { fontWeight: global_FontWeight_bold.value },
  link: { color: global_link_Color.value },
  text: { fontSize: 12 },
  textMargin: { marginTop: global_spacer_md.value },
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
    color: chart_global_Fill_Color_700.value,
    paddingLeft: c_table_m_compact_cell_PaddingLeft.value,
    paddingBottom: c_table_m_compact_cell_PaddingBottom.value,
    paddingTop: c_table_m_compact_cell_PaddingTop.value,
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

const NewSystemsPdfBuild = ({ asyncData }) => {
  const { data, options } = asyncData.data;
  const filters = {
    sort: '-last_seen',
    limit: '20',
    offset: '0',
    hits: 'all',
  };

  return (
    <div style={styles.document}>
      <span style={{ fontSize: '24px', color: chart_color_red_100.value }}>
        Red Hat Insights
      </span>
      <br />
      <span style={{ fontSize: '32px', color: chart_color_red_100.value }}>
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

NewSystemsPdfBuild.propTypes = {
  asyncData: PropTypes.object,
};

export default NewSystemsPdfBuild;
