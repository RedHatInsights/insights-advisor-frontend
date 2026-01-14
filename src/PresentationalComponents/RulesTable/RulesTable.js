import './_RulesTable.scss';
import { DEBOUNCE_DELAY } from '../../AppConstants';
import {
  Pagination,
  PaginationVariant,
} from '@patternfly/react-core/dist/esm/components/Pagination/Pagination';
import React, { useContext, useEffect, useState } from 'react';

import {
  Table,
  Thead,
  Tr,
  Th,
  Tbody,
  Td,
  ExpandableRowContent,
  ActionsColumn,
} from '@patternfly/react-table';
import TableToolbar from '@redhat-cloud-services/frontend-components/TableToolbar';

import {
  filterFetchBuilder,
  urlBuilder,
  workloadQueryBuilder,
} from '../Common/Tables';
import { useDispatch, useSelector } from 'react-redux';

import DisableRule from '../Modals/DisableRule';
import { ErrorState } from '@redhat-cloud-services/frontend-components/ErrorState';
import { PrimaryToolbar } from '@redhat-cloud-services/frontend-components/PrimaryToolbar';
import ViewHostAcks from '../../PresentationalComponents/Modals/ViewHostAcks';
import debounce from '../../Utilities/Debounce';
import downloadReport from '../Common/DownloadHelper';
import messages from '../../Messages';

import { updateRecFilters } from '../../Services/Filters';
import { useGetRecsQuery } from '../../Services/Recs';
import { useIntl } from 'react-intl';
import PropTypes from 'prop-types';
import { filtersInitialState } from '../../Services/Filters';
import {
  buildRows,
  emptyRows,
  filterConfigItems,
  urlFilterBuilder,
  getColumns,
  sortIndices,
  getActiveFiltersConfig,
  getDefaultImpactingFilter,
} from './helpers';
import { useActionsResolver } from './useActionsResolver';
import impactingFilter from '../Filters/impactingFilter';
import { AccountStatContext } from '../../ZeroStateWrapper';
import { SkeletonTable } from '@patternfly/react-component-groups';
import { EnvironmentContext } from '../../App';

const RulesTable = ({ isTabActive, pathway }) => {
  const intl = useIntl();
  const dispatch = useDispatch();
  const envContext = useContext(EnvironmentContext);
  const cols = getColumns(intl);

  const selectedTags = useSelector(({ filters }) => filters.selectedTags);
  const workloads = useSelector(({ filters }) => filters.workloads);
  const filters = useSelector(({ filters }) => filters.recState);

  const [expandedRows, setExpandedRows] = useState(new Set());
  const [areAllExpanded, setAreAllExpanded] = useState(false);
  const [sortBy, setSortBy] = useState({});
  const [filterBuilding, setFilterBuilding] = useState(true);
  const [searchText, setSearchText] = useState(filters?.text || '');
  const [disableRuleOpen, setDisableRuleOpen] = useState(false);
  const [selectedRule, setSelectedRule] = useState({});
  const [viewSystemsModalOpen, setViewSystemsModalOpen] = useState(false);
  const [viewSystemsModalRule, setViewSystemsModalRule] = useState({});
  const setFilters = (filters) => dispatch(updateRecFilters(filters));
  const { hasEdgeDevices, edgeQuerySuccess } = useContext(AccountStatContext);

  const options = {
    ...(selectedTags?.length ? { tags: selectedTags.join(',') } : {}),
    ...(workloads ? workloadQueryBuilder(workloads) : {}),
    ...(pathway ? { pathway } : {}),
  };

  const {
    data: rules = [],
    isFetching,
    isLoading,
    isError,
    refetch,
  } = useGetRecsQuery({
    ...filterFetchBuilder(filters),
    ...options,
    customBasePath: envContext.BASE_URL,
  });

  const debouncedSearchText = debounce(searchText, DEBOUNCE_DELAY);
  const results = rules?.meta?.count || 0;

  useEffect(() => {
    if (!filterBuilding && selectedTags !== null) {
      urlBuilder(filters, selectedTags);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, selectedTags, workloads]);

  const onSort = (_event, index, direction) => {
    const orderParam = `${direction === 'asc' ? '' : '-'}${sortIndices[index]}`;
    setSortBy({ index, direction });
    setFilters({ ...filters, sort: orderParam, offset: 0 });
  };

  const onSetPage = (pageNumber) => {
    const newOffset = pageNumber * filters.limit - filters.limit;
    setFilters({ ...filters, offset: newOffset });
  };

  const toggleRulesDisabled = (rule_status) => {
    setFilters({
      ...filters,
      rule_status,
      offset: 0,
    });
  };

  // Build rows from the old structure
  const buildRowsFromOldFormat = () => {
    if (!rules.data) return [];

    if (rules.data.length === 0) {
      return emptyRows(filters, toggleRulesDisabled);
    }

    return buildRows(
      rules,
      areAllExpanded,
      setViewSystemsModalRule,
      setViewSystemsModalOpen,
      intl,
      envContext,
    );
  };

  const rows = buildRowsFromOldFormat();

  const actionResolver = useActionsResolver(
    rows,
    setSelectedRule,
    setDisableRuleOpen,
    refetch,
    envContext.BASE_URL,
  );

  const impactingFilterDef = impactingFilter(
    setFilters,
    filters,
    hasEdgeDevices,
  );

  // Builds table filters from url params depending on the query success
  useEffect(() => {
    if (isTabActive && filterBuilding && !hasEdgeDevices) {
      urlFilterBuilder(sortIndices, setSearchText, setFilters, filters);
    }
    if (isTabActive && filterBuilding && hasEdgeDevices) {
      urlFilterBuilder(sortIndices, setSearchText, setFilters, {
        ...filtersInitialState.recState,
        ...getDefaultImpactingFilter(hasEdgeDevices),
      });
    }
    setFilterBuilding(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [edgeQuerySuccess]);

  useEffect(() => {
    const sortIndex = Object.entries(sortIndices)?.find(
      (item) => item[1] === filters.sort || `-${item[1]}` === filters.sort,
    );
    if (filters.sort !== undefined && sortIndex) {
      const sortDirection = filters.sort[0] === '-' ? 'desc' : 'asc';
      setSortBy({ index: Number(sortIndex[0]), direction: sortDirection });
    }
  }, [filters.sort]);

  useEffect(() => {
    if (!filterBuilding && !isLoading) {
      const filter = { ...filters };
      const text = searchText.length ? { text: searchText } : {};
      delete filter.text;
      setFilters({ ...filter, ...text, offset: 0 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchText]);

  const activeFiltersConfig = getActiveFiltersConfig(
    filters,
    intl,
    setSearchText,
    setFilters,
    hasEdgeDevices,
  );

  const isRowExpanded = (rowIndex) => expandedRows.has(rowIndex);

  const setRowExpanded = (rowIndex, isExpanding) => {
    setExpandedRows((prevExpanded) => {
      const newExpanded = new Set(prevExpanded);
      if (isExpanding) {
        newExpanded.add(rowIndex);
      } else {
        newExpanded.delete(rowIndex);
      }
      return newExpanded;
    });
  };

  const onExpandAll = () => {
    if (areAllExpanded) {
      // All rows are currently expanded, so collapse all rows
      setExpandedRows(new Set());
    } else {
      // Expand all rows
      const allRowIndices = new Set();
      rows.forEach((row, idx) => {
        if (row.parent === undefined) {
          allRowIndices.add(idx);
        }
      });
      setExpandedRows(allRowIndices);
    }
    setAreAllExpanded(!areAllExpanded);
  };

  const getColumnSortParams = (columnIndex) => ({
    sortBy: {
      index: sortBy.index,
      direction: sortBy.direction,
    },
    onSort,
    columnIndex,
  });

  return (
    <React.Fragment>
      {viewSystemsModalOpen && (
        <ViewHostAcks
          handleModalToggle={(toggleModal) =>
            setViewSystemsModalOpen(toggleModal)
          }
          isModalOpen={viewSystemsModalOpen}
          afterFn={refetch}
          rule={viewSystemsModalRule}
        />
      )}
      {disableRuleOpen && (
        <DisableRule
          handleModalToggle={setDisableRuleOpen}
          isModalOpen={disableRuleOpen}
          rule={selectedRule}
          afterFn={refetch}
        />
      )}
      <PrimaryToolbar
        pagination={{
          itemCount: results,
          page: filters.offset / filters.limit + 1,
          perPage: Number(filters.limit),
          onSetPage(_event, page) {
            onSetPage(page);
          },
          onPerPageSelect(_event, perPage) {
            setFilters({ ...filters, limit: perPage, offset: 0 });
          },
          isCompact: true,
        }}
        exportConfig={
          envContext.isExportEnabled && {
            label: intl.formatMessage(messages.exportCsv),
            label: intl.formatMessage(messages.exportJson),
            onSelect: (_e, fileType) =>
              downloadReport(
                'hits',
                fileType,
                filterFetchBuilder(filters),
                selectedTags,
                workloads,
                dispatch,
                envContext.BASE_URL,
              ),
            tooltipText: intl.formatMessage(messages.exportData),
          }
        }
        filterConfig={{
          items: [
            ...filterConfigItems(
              filters,
              setFilters,
              searchText,
              setSearchText,
              toggleRulesDisabled,
              intl,
            ),
            impactingFilterDef,
          ],
        }}
        activeFiltersConfig={activeFiltersConfig}
      />
      {isFetching ? (
        <SkeletonTable
          columns={cols.map((c) => c.title)}
          isExpandable
          variant="compact"
        />
      ) : isError ? (
        <Table>
          <ErrorState />
        </Table>
      ) : (
        <Table
          aria-label={'rules-table'}
          ouiaId={'rules-table'}
          variant="compact"
          isStickyHeader
        >
          <Thead>
            <Tr>
              <Th
                expand={{
                  areAllExpanded: !areAllExpanded,
                  onToggle: onExpandAll,
                }}
              />
              {cols.map((col, index) => (
                <Th
                  key={index}
                  data-label={col.title}
                  sort={col.sortable ? getColumnSortParams(index) : undefined}
                  width={col.width}
                  modifier={col.modifier}
                >
                  {col.title}
                </Th>
              ))}
              {envContext.isDisableRecEnabled && <Th />}
            </Tr>
          </Thead>
          <Tbody>
            {rows.map((row, rowIndex) => {
              // Handle empty state row
              if (row.cells && row.cells[0]?.props?.colSpan) {
                return (
                  <Tr key={rowIndex}>
                    <Td
                      data-label={row.cells[0].title}
                      colSpan={cols.length + 2}
                    >
                      {row.cells[0].title}
                    </Td>
                  </Tr>
                );
              }

              // Handle child/expandable content rows
              if (row.parent !== undefined) {
                const parentIndex = row.parent;
                return (
                  <Tr key={rowIndex} isExpanded={isRowExpanded(parentIndex)}>
                    <Td
                      data-label={row.cells[0].title}
                      colSpan={cols.length + 2}
                    >
                      <ExpandableRowContent>
                        {row.cells[0].title}
                      </ExpandableRowContent>
                    </Td>
                  </Tr>
                );
              }

              // Handle parent/main rows
              const isExpanded = isRowExpanded(rowIndex);
              const actions = envContext.isDisableRecEnabled
                ? actionResolver(row, { rowIndex })
                : null;

              return (
                <Tr key={rowIndex} className={isExpanded ? 'expanded-row' : ''}>
                  <Td
                    expand={{
                      rowIndex,
                      isExpanded,
                      onToggle: (_event, _rowIndex, isExpanding) =>
                        setRowExpanded(rowIndex, isExpanding),
                    }}
                  />
                  {row.cells.map((cell, cellIndex) => (
                    <Td key={cellIndex} data-label={cols[cellIndex]?.title}>
                      {cell.title}
                    </Td>
                  ))}
                  {envContext.isDisableRecEnabled && actions && (
                    <Td isActionCell>
                      <ActionsColumn items={actions} />
                    </Td>
                  )}
                </Tr>
              );
            })}
          </Tbody>
        </Table>
      )}
      <TableToolbar isFooter>
        <Pagination
          ouiaId="page"
          itemCount={results}
          page={filters.offset / filters.limit + 1}
          perPage={Number(filters.limit)}
          onSetPage={(_e, page) => {
            onSetPage(page);
          }}
          onPerPageSelect={(_e, perPage) => {
            setFilters({ ...filters, limit: perPage, offset: 0 });
          }}
          widgetId={`pagination-options-menu-bottom`}
          variant={PaginationVariant.bottom}
        />
      </TableToolbar>
    </React.Fragment>
  );
};

RulesTable.propTypes = {
  isTabActive: PropTypes.bool,
  pathway: PropTypes.string,
};

export default RulesTable;
