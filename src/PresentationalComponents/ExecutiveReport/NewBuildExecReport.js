import React from 'react';
import PropTypes from 'prop-types';
import { Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';

import { RULES_FETCH_URL } from '../../AppConstants';

/**
 * @type {FetchData}
 */
export const fetchData = async (createAsyncRequest) => {
  const statsReports = createAsyncRequest('advisor-backend', {
    method: 'GET',
    url: RULES_FETCH_URL,
  });

  const data = await Promise.all([statsReports]);

  return data;
};

const NewBuildExecReport = ({ asyncData }) => {
  const { data } = asyncData;

  return (
    <>
      <Table aria-label="Simple Table" variant="compact">
        <Thead>
          <Tr>
            <Th>System</Th>
            <Th>Report</Th>
          </Tr>
        </Thead>
        <Tbody>
          {data
            ? data.map((row, index) => (
                <Tr key={index}>
                  <Td>{row[0].description}</Td>
                  <Td>{row[1].description}</Td>
                </Tr>
              ))
            : 'No data, this is a test'}
        </Tbody>
      </Table>
    </>
  );
};

NewBuildExecReport.propTypes = {
  asyncData: PropTypes.shape({
    data: PropTypes.arrayOf(
      PropTypes.arrayOf(
        PropTypes.shape({
          description: PropTypes.string.isRequired,
        })
      )
    ),
  }).isRequired,
};

export default NewBuildExecReport;
