import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useLocation } from 'react-router-dom';
import { TableToolsTable, TableStateProvider } from 'bastilian-tabletools';
import { useFullTableState } from 'bastilian-tabletools/dist/hooks';
import { SkeletonTable } from '@patternfly/react-component-groups';
import { useIntl } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { ErrorState } from '@redhat-cloud-services/frontend-components/ErrorState';
import { Table } from '@patternfly/react-table';
import columns from './Columns';
import filters from './Filters';
import { useGetPathwaysQuery } from '../../Services/Pathways';
import { updatePathFilters } from '../../Services/Filters';
import {
  filterFetchBuilder,
  paramParser,
  urlBuilder,
  workloadQueryBuilder,
} from '../Common/Tables';
import {
  paginationSerialiser,
  sortSerialiser,
  filtersSerialiser,
} from '../../Utilities/tableSerializers';

/**
 * Inner table component that uses bastilian-tabletools with server-side operations.
 * Requires TableStateProvider context for state management.
 *
 * Integrates TableToolsTable state with Redux filters and URL params:
 * - Reads URL params on mount and syncs to Redux
 * - Watches TableToolsTable state changes via useFullTableState hook
 * - Syncs table state changes back to Redux
 * - Updates URL when Redux filters change
 *
 * @param {object} props - Component props
 * @param {boolean} props.isTabActive - Whether the pathways tab is currently active
 * @returns {JSX.Element} Pathways table with server-side pagination/filtering/sorting
 */
const PathwaysTableInner = ({ isTabActive }) => {
  const { tableState } = useFullTableState() || {};
  const intl = useIntl();
  const dispatch = useDispatch();
  const { search } = useLocation();

  const selectedTags = useSelector(({ filters }) => filters.selectedTags);
  const workloads = useSelector(({ filters }) => filters.workloads);
  const reduxFilters = useSelector(({ filters }) => filters.pathState);
  const setFilters = useCallback(
    (filters) => dispatch(updatePathFilters(filters)),
    [dispatch],
  );

  const [filterBuilding, setFilterBuilding] = useState(true);

  let options = {};
  selectedTags?.length &&
    (options = {
      ...options,
      ...{ tags: selectedTags.join(',') },
    });
  workloads && (options = { ...options, ...workloadQueryBuilder(workloads) });

  const {
    data: pathways = [],
    isFetching,
    isLoading,
    isError,
  } = useGetPathwaysQuery({
    ...filterFetchBuilder(reduxFilters),
    ...options,
  });

  const tableColumns = columns(intl);
  const tableFilters = filters(intl);

  useEffect(() => {
    if (isTabActive && filterBuilding) {
      const paramsObject = search ? paramParser() : {};
      delete paramsObject.tags;

      paramsObject.sort =
        paramsObject.sort === undefined ||
        !tableColumns.some(
          (col) => col.sortable === paramsObject?.sort[0]?.replace(/^-/, ''),
        )
          ? '-recommendation_level'
          : paramsObject.sort[0];
      paramsObject.offset =
        paramsObject.offset === undefined ? 0 : Number(paramsObject.offset[0]);
      paramsObject.limit =
        paramsObject.limit === undefined ? 20 : Number(paramsObject.limit[0]);

      if (
        paramsObject.reboot_required !== undefined &&
        !Array.isArray(paramsObject.reboot_required)
      ) {
        paramsObject.reboot_required = [`${paramsObject.reboot_required}`];
      }
      if (
        paramsObject.has_incident !== undefined &&
        !Array.isArray(paramsObject.has_incident)
      ) {
        paramsObject.has_incident = [`${paramsObject.has_incident}`];
      }
      if (
        paramsObject.category !== undefined &&
        !Array.isArray(paramsObject.category)
      ) {
        paramsObject.category = Array.isArray(paramsObject.category)
          ? paramsObject.category
          : [paramsObject.category];
      }

      setFilters({ ...reduxFilters, ...paramsObject });
    }

    setFilterBuilding(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!filterBuilding && selectedTags !== null) {
      urlBuilder(reduxFilters, selectedTags);
    }
  }, [reduxFilters, selectedTags, workloads, filterBuilding]);

  useEffect(() => {
    if (!tableState || filterBuilding) {
      return;
    }

    const newFilters = { ...reduxFilters };
    let changed = false;

    // Handle pagination
    if (tableState.pagination) {
      const { offset, limit } = paginationSerialiser(tableState.pagination);
      if (offset !== undefined && offset !== reduxFilters.offset) {
        newFilters.offset = offset;
        changed = true;
      }
      if (limit !== undefined && limit !== reduxFilters.limit) {
        newFilters.limit = limit;
        newFilters.offset = 0;
        changed = true;
      }
    }

    // Handle sorting
    if (tableState.sort) {
      const sortParam = sortSerialiser(tableState.sort, tableColumns);
      if (sortParam && sortParam !== reduxFilters.sort) {
        newFilters.sort = sortParam;
        newFilters.offset = 0;
        changed = true;
      }
    }

    // Handle filters
    if (tableState.filters !== undefined) {
      const apiFilters = filtersSerialiser(tableState.filters, tableFilters);

      // Text filter
      if (apiFilters.text !== reduxFilters.text) {
        if (apiFilters.text) {
          newFilters.text = apiFilters.text;
        } else {
          delete newFilters.text;
        }
        newFilters.offset = 0;
        changed = true;
      }

      // Category filter
      const newCategory = apiFilters.category || [];
      const oldCategory = reduxFilters.category || [];
      if (JSON.stringify(newCategory) !== JSON.stringify(oldCategory)) {
        if (newCategory.length > 0) {
          newFilters.category = newCategory;
        } else {
          delete newFilters.category;
        }
        newFilters.offset = 0;
        changed = true;
      }

      // Has incident filter
      const newIncident = apiFilters.has_incident || [];
      const oldIncident = reduxFilters.has_incident || [];
      if (JSON.stringify(newIncident) !== JSON.stringify(oldIncident)) {
        if (newIncident.length > 0) {
          newFilters.has_incident = newIncident;
        } else {
          delete newFilters.has_incident;
        }
        newFilters.offset = 0;
        changed = true;
      }

      // Reboot required filter
      const newReboot = apiFilters.reboot_required || [];
      const oldReboot = reduxFilters.reboot_required || [];
      if (JSON.stringify(newReboot) !== JSON.stringify(oldReboot)) {
        if (newReboot.length > 0) {
          newFilters.reboot_required = newReboot;
        } else {
          delete newFilters.reboot_required;
        }
        newFilters.offset = 0;
        changed = true;
      }
    }

    if (changed) {
      setFilters(newFilters);
    }
  }, [
    tableState,
    filterBuilding,
    reduxFilters,
    tableColumns,
    tableFilters,
    setFilters,
  ]);

  if (isError) {
    return (
      <Table>
        <ErrorState />
      </Table>
    );
  }

  if (isLoading) {
    return (
      <SkeletonTable
        columns={tableColumns.map((c) => c.title)}
        variant="compact"
      />
    );
  }

  const initialPage = Math.floor(reduxFilters.offset / reduxFilters.limit) + 1;
  const initialPerPage = reduxFilters.limit;

  let initialSortIndex = 4; // Default: recommendation_level desc
  let initialSortDirection = 'desc';
  if (reduxFilters.sort) {
    const sortField = reduxFilters.sort.replace(/^-/, '');
    const sortDirection = reduxFilters.sort.startsWith('-') ? 'desc' : 'asc';
    const sortIndex = tableColumns.findIndex(
      (col) => col.sortable === sortField,
    );
    if (sortIndex !== -1) {
      initialSortIndex = sortIndex;
      initialSortDirection = sortDirection;
    }
  }

  // Map Redux filters to TableToolsTable activeFilters.
  // TableToolsTable converts filter labels to kebab-case IDs: "Reboot required" → "reboot-required"
  const activeFilters = {};
  if (reduxFilters.text) {
    activeFilters.name = [reduxFilters.text];
  }
  if (reduxFilters.category && reduxFilters.category.length > 0) {
    activeFilters.category = reduxFilters.category;
  }
  if (reduxFilters.has_incident && reduxFilters.has_incident.length > 0) {
    activeFilters['has-incident'] = reduxFilters.has_incident;
  }
  if (reduxFilters.reboot_required && reduxFilters.reboot_required.length > 0) {
    activeFilters['reboot-required'] = reduxFilters.reboot_required;
  }

  return (
    <TableToolsTable
      items={pathways?.data || []}
      columns={tableColumns}
      total={pathways?.meta?.count || 0}
      loading={isFetching}
      filters={{
        filterConfig: tableFilters,
        activeFilters: activeFilters,
      }}
      options={{
        serialisers: {
          pagination: paginationSerialiser,
          sort: (sortState) => sortSerialiser(sortState, tableColumns),
          filters: (filterState) =>
            filtersSerialiser(filterState, tableFilters),
        },
        pagination: {
          page: initialPage,
          perPage: initialPerPage,
        },
        sortBy: {
          index: initialSortIndex,
          direction: initialSortDirection,
        },
        variant: 'compact',
        isStickyHeader: true,
      }}
      aria-label="pathways-table"
      ouiaId="pathways-table"
    />
  );
};

PathwaysTableInner.propTypes = {
  isTabActive: PropTypes.bool,
};

/**
 * PathwaysTable component using bastilian-tabletools with server-side sorting, filtering, and pagination.
 * Integrates with Redux state management and RTK Query for API calls.
 *
 * @param {object} props - Component props
 * @param {boolean} props.isTabActive - Whether the pathways tab is currently active
 * @returns {JSX.Element} Pathways table component wrapped in TableStateProvider
 */
const PathwaysTableNew = ({ isTabActive }) => {
  return (
    <TableStateProvider>
      <PathwaysTableInner isTabActive={isTabActive} />
    </TableStateProvider>
  );
};

PathwaysTableNew.propTypes = {
  isTabActive: PropTypes.bool,
};

export default PathwaysTableNew;
