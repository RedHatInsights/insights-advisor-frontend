import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { TableToolsTable, TableStateProvider } from 'bastilian-tabletools';
import { useSelector } from 'react-redux';
import columns from './Columns';
import filters from './Filters';
import usePathwaysQuery from '../../Services/hooks/usePathwaysQuery';
import { workloadQueryBuilder } from '../Common/Tables';
import useAdvisorTableDefaults from '../../Utilities/useAdvisorTableDefaults';

/**
 * Inner component that renders the Pathways table with bastilian-tabletools
 * Handles data fetching with external filters (tags/workspaces/workloads) integration
 *
 * @component
 * @param {object} props - Component props
 * @param {boolean} props.isTabActive - Whether the tab is currently active (controls data fetching)
 * @param {string[]} [props.selectedTags] - Array of selected tag names from global filter
 * @param {string[]} [props.selectedGroups] - Array of selected workspace names from global filter
 * @param {object} [props.workloads] - Workloads object from global filter { [key]: { isSelected: boolean } }
 * @returns {React.Element} TableToolsTable component with pathways data
 */
const PathwaysTableInner = ({
  isTabActive,
  selectedTags,
  selectedGroups,
  workloads,
}) => {
  const advisorTableDefaults = useAdvisorTableDefaults({ columns, filters });
  const filterConfig = useMemo(() => ({ filterConfig: filters }), []);

  const additionalParams = useMemo(() => {
    let params = {};
    if (selectedTags?.length) {
      params.tags = selectedTags.join(',');
    }
    if (selectedGroups?.length) {
      params.groups = Array.isArray(selectedGroups)
        ? selectedGroups.join(',')
        : selectedGroups;
    }
    if (workloads) {
      params = {
        ...params,
        ...workloadQueryBuilder(workloads),
      };
    }
    return params;
  }, [selectedTags, selectedGroups, workloads]);

  const { data, loading } = usePathwaysQuery({
    useTableState: true,
    skip: !isTabActive,
    params: additionalParams,
  });

  const items = data?.data || [];
  const total = data?.meta?.total;

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
      total={total}
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
  selectedGroups: PropTypes.array,
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
  const selectedGroups = useSelector(({ filters }) => filters.selectedGroups);
  const workloads = useSelector(({ filters }) => filters.workloads);

  return (
    <TableStateProvider>
      <PathwaysTableInner
        isTabActive={isTabActive}
        selectedTags={selectedTags}
        selectedGroups={selectedGroups}
        workloads={workloads}
      />
    </TableStateProvider>
  );
};

PathwaysTableNew.propTypes = {
  isTabActive: PropTypes.bool,
};

export default PathwaysTableNew;
