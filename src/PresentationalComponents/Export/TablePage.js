import {
  BASE_URI,
  LAST_SEEN,
  NAME,
  RECOMMENDATIONS,
  TOTAL_RISK_CONSTANTS,
} from '../../AppConstants';
import PropTypes from 'prop-types';
import React from 'react';
import { Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import global_BackgroundColor_200 from '@patternfly/react-tokens/dist/js/global_BackgroundColor_200';

export const TablePage = ({ systems, styles }) => {
  const header = [
    { value: NAME, style: styles.nameColumn },
    {
      value: RECOMMENDATIONS,
      style: { fontSize: 8, textAlign: 'center', width: '10px' },
    },
    {
      value: TOTAL_RISK_CONSTANTS.CRITICAL,
      style: { fontSize: 8, textAlign: 'center', width: '10px' },
    },
    {
      value: TOTAL_RISK_CONSTANTS.IMPORTANT,
      style: { fontSize: 8, textAlign: 'center', width: '10px' },
    },
    {
      value: TOTAL_RISK_CONSTANTS.MODERATE,
      style: { fontSize: 8, textAlign: 'center', width: '10px' },
    },
    {
      value: TOTAL_RISK_CONSTANTS.LOW,
      style: { fontSize: 8, textAlign: 'center', width: '10px' },
    },
    {
      value: LAST_SEEN,
      style: { fontSize: 8 },
    },
  ];
  const hitColumns = [
    'hits',
    'critical_hits',
    'important_hits',
    'moderate_hits',
    'low_hits',
  ];

  const headerBuilder = ({ value, style }) => (
    <Th style={{ ...style, ...styles.header, ...styles.bold }}>{value}</Th>
  );
  const rowBuilder = ({ value }) => (
    <Td noPadding={true} style={styles.row}>
      {value}
    </Td>
  );
  const rows = [
    ...systems.map((system, idx) => {
      const [, date, month, year, time] = new Date(system.last_seen)
        .toUTCString()
        .split(' ');
      const sysDate = `${date} ${month} ${year}, ${time
        .split(':')
        .slice(0, 2)
        .join(':')} UTC`;

      const isOddRow = (idx + 1) % 2;
      const customStyle = {
        backgroundColor: global_BackgroundColor_200.var,
      };
      return (
        <Tr
          noPadding={true}
          key={`${system.display_name}`}
          style={isOddRow ? customStyle : {}}
        >
          <Td
            key={system.system_uuid}
            style={{ ...styles.nameColumn }}
            noPadding={true}
          >
            <a
              style={styles.link}
              href={`${BASE_URI}/insights/advisor/systems/${system.system_uuid}/`}
            >
              {system.display_name}
            </a>
          </Td>
          {...hitColumns.map((item) =>
            rowBuilder({
              value: system[item],
            }),
          )}
          <Td
            key={system.last_seen}
            style={{ ...styles.row, ...styles.lastSeenRow }}
            noPadding={true}
          >{`${sysDate}`}</Td>
        </Tr>
      );
    }),
  ];

  return (
    <Table variant="compact">
      <Thead>
        {header.map((colHeader) =>
          headerBuilder({ value: colHeader.value, style: colHeader.style }),
        )}
      </Thead>
      <Tbody>{rows.map((row) => row)}</Tbody>
    </Table>
  );
};

TablePage.propTypes = {
  systems: PropTypes.object,
  page: PropTypes.number,
  styles: PropTypes.node,
};

export default TablePage;
