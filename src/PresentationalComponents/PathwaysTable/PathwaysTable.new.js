import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { TableToolsTable, TableStateProvider } from 'bastilian-tabletools';
import { useSelector } from 'react-redux';
import columns from './Columns';
import filters from './Filters';
import { usePathwaysQuery } from '../../Services/Pathways/usePathwaysQuery';
import { workloadQueryBuilder } from '../Common/Tables';
import useAdvisorTableDefaults from '../../Utilities/useAdvisorTableDefaults';

/**
 * Inner component that renders the Pathways table with bastilian-tabletools
 * Handles data fetching with external filters (tags/workloads) integration
 *
 * @component
 * @param {object} props - Component props
 * @param {boolean} props.isTabActive - Whether the tab is currently active (controls data fetching)
 * @param {string[]} props.selectedTags - Array of selected tag names from global filter
 * @param {object} props.workloads - Workloads object from global filter { [key]: { isSelected: boolean } }
 * @returns {React.Element} TableToolsTable component with pathways data
 */
const PathwaysTableInner = ({ isTabActive, selectedTags, workloads }) => {
  const advisorTableDefaults = useAdvisorTableDefaults();
  const filterConfig = useMemo(() => ({ filterConfig: filters }), []);

  /**
   * Build additional API parameters from global filters (tags/workloads)
   * These are merged with table state (pagination, sort, filters) in usePathwaysQuery
   *
   * Result format: { tags: 'tag1,tag2', SAP: true, ... }
   */
  const additionalParams = useMemo(() => {
    let params = {};
    if (selectedTags?.length) {
      params.tags = selectedTags.join(',');
    }
    if (workloads) {
      params = {
        ...params,
        ...workloadQueryBuilder(workloads),
      };
    }
    return params;
  }, [selectedTags, workloads]);

  const { items, loading } = usePathwaysQuery({
    useTableState: true,
    enabled: isTabActive,
    additionalParams,
  });

  const tableOptions = useMemo(
    () => ({
      ...advisorTableDefaults,
      sortBy: { index: 4, direction: 'desc' },
    }),
    [advisorTableDefaults],
  );

  return (
    <TableToolsTable
      items={items}
      columns={columns}
      filters={filterConfig}
      options={tableOptions}
      aria-label="pathways-table"
      ouiaId="pathways-table"
      data-ouia-safe={!loading}
    />
  );
};

PathwaysTableInner.propTypes = {
  isTabActive: PropTypes.bool,
  selectedTags: PropTypes.array,
  workloads: PropTypes.object,
};

/**
 * Pathways table implementation using bastilian-tabletools
 * Provides table state management and integrates with Redux global filters
 *
 * Features:
 * - Server-side pagination, sorting, and filtering
 * - Integration with global tags/workloads filters from Redux
 * - Automatic refetch when external filters change
 * - URL state synchronization via TableStateProvider
 *
 * @component
 * @param {object} props - Component props
 * @param {boolean} props.isTabActive - Whether the Pathways tab is currently active
 * @returns {React.Element} TableStateProvider wrapping PathwaysTableInner
 *
 * @example
 * <PathwaysTableNew isTabActive={true} />
 */
const PathwaysTableNew = ({ isTabActive }) => {
  const selectedTags = useSelector(({ filters }) => filters.selectedTags);
  const workloads = useSelector(({ filters }) => filters.workloads);

  return (
    <TableStateProvider>
      <PathwaysTableInner
        isTabActive={isTabActive}
        selectedTags={selectedTags}
        workloads={workloads}
      />
    </TableStateProvider>
  );
};

PathwaysTableNew.propTypes = {
  isTabActive: PropTypes.bool,
};

export default PathwaysTableNew;
