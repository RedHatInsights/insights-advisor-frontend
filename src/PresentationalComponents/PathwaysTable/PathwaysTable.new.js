import React, { useMemo, useRef } from 'react';
import PropTypes from 'prop-types';
import { TableToolsTable, TableStateProvider } from 'bastilian-tabletools';
import { SkeletonTable } from '@patternfly/react-component-groups';
import { useSelector } from 'react-redux';
import { ErrorState } from '@redhat-cloud-services/frontend-components/ErrorState';
import { Table } from '@patternfly/react-table';
import columns from './Columns';
import filters from './Filters';
import { usePathwaysQuery } from '../../Services/Pathways/usePathwaysQuery';
import { workloadQueryBuilder } from '../Common/Tables';
import useAdvisorTableDefaults from '../../Utilities/useAdvisorTableDefaults';
import { useSyncTableStateToUrl } from '../../Utilities/useTableStateUrlSync';

const PathwaysTableInner = ({ isTabActive, selectedTags, workloads }) => {
  const advisorTableDefaults = useAdvisorTableDefaults();
  const hasLoadedOnce = useRef(false);
  const filterConfig = useMemo(() => ({ filterConfig: filters }), []);

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

  useSyncTableStateToUrl(additionalParams, isTabActive);

  const { items, total, loading, error } = usePathwaysQuery({
    useTableState: true,
    enabled: isTabActive,
    additionalParams,
  });

  // Track if we've loaded data at least once
  if (items) {
    hasLoadedOnce.current = true;
  }

  // Combine default options with sortBy
  const tableOptions = useMemo(
    () => ({
      ...advisorTableDefaults,
      sortBy: { index: 4, direction: 'desc' },
    }),
    [advisorTableDefaults],
  );

  if (error) {
    return (
      <Table>
        <ErrorState />
      </Table>
    );
  }

  // Only show skeleton on INITIAL load, not during refetches
  if (loading && !hasLoadedOnce.current) {
    return (
      <SkeletonTable columns={columns.map((c) => c.title)} variant="compact" />
    );
  }

  return (
    <TableToolsTable
      items={items || []}
      columns={columns}
      total={total || 0}
      loading={loading}
      filters={filterConfig}
      options={tableOptions}
      aria-label="pathways-table"
      ouiaId="pathways-table"
    />
  );
};

PathwaysTableInner.propTypes = {
  isTabActive: PropTypes.bool,
  selectedTags: PropTypes.array,
  workloads: PropTypes.object,
};

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
