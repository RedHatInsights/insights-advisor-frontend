import React from 'react';
import propTypes from 'prop-types';
import { TableToolsTable } from 'bastilian-tabletools';
import {
  paginationSerialiser,
  sortSerialiser,
  filtersSerialiser,
} from '../../Utilities/tableSerializers';

/**
 * Wrapper for TableToolsTable with Advisor-specific API serializers
 * @param {object} props - Component props passed through to TableToolsTable
 * @returns {React.Element}
 */
const AdvisorTable = (props) => {
  return (
    <TableToolsTable
      {...props}
      options={{
        serialisers: {
          pagination: paginationSerialiser,
          sort: sortSerialiser,
          filters: filtersSerialiser,
        },
        ...props.options,
      }}
    />
  );
};

AdvisorTable.propTypes = {
  items: propTypes.array,
  columns: propTypes.array,
  total: propTypes.number,
  loading: propTypes.bool,
  filters: propTypes.object,
  options: propTypes.object,
};

export default AdvisorTable;
