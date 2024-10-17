import './_RulesTable.scss';
import * as AppConstants from '../../AppConstants';
import { DEBOUNCE_DELAY } from '../../AppConstants';
import {
  Pagination,
  PaginationVariant,
} from '@patternfly/react-core/dist/esm/components/Pagination/Pagination';
import React, { useContext, useEffect, useState } from 'react';

import { TableVariant } from '@patternfly/react-table';
import {
  Table,
  TableBody,
  TableHeader,
} from '@patternfly/react-table/deprecated';
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
import { usePermissions } from '@redhat-cloud-services/frontend-components-utilities/RBACHook';
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

const RulesTable = ({ isTabActive, pathway }) => {
  const intl = useIntl();
  const dispatch = useDispatch();
  const permsExport = usePermissions(
    'advisor',
    AppConstants.PERMS.export
  ).hasAccess;
  const permsDisableRec = usePermissions(
    'advisor',
    AppConstants.PERMS.disableRec
  ).hasAccess;
  const cols = getColumns(intl);

  const selectedTags = useSelector(({ filters }) => filters.selectedTags);
  const workloads = useSelector(({ filters }) => filters.workloads);
  const SID = useSelector(({ filters }) => filters.SID);
  const filters = useSelector(({ filters }) => filters.recState);

  const [rows, setRows] = useState([]);
  const [sortBy, setSortBy] = useState({});
  const [filterBuilding, setFilterBuilding] = useState(true);
  const [searchText, setSearchText] = useState(filters?.text || '');
  const [disableRuleOpen, setDisableRuleOpen] = useState(false);
  const [selectedRule, setSelectedRule] = useState({});
  const [viewSystemsModalOpen, setViewSystemsModalOpen] = useState(false);
  const [viewSystemsModalRule, setViewSystemsModalRule] = useState({});
  const [isAllExpanded, setIsAllExpanded] = useState(false);
  const setFilters = (filters) => dispatch(updateRecFilters(filters));
  const { hasEdgeDevices, edgeQuerySuccess } = useContext(AccountStatContext);

  const options = {
    ...(selectedTags?.length ? { tags: selectedTags.join(',') } : {}),
    ...(workloads ? workloadQueryBuilder(workloads, SID) : {}),
    ...(pathway ? { pathway } : {}),
  };

  const {
    data: rules = [],
    isFetching,
    isLoading,
    isError,
    refetch,
  } = useGetRecsQuery({ ...filterFetchBuilder(filters), ...options });

  const debouncedSearchText = debounce(searchText, DEBOUNCE_DELAY);
  const results = rules?.meta?.count || 0;

  useEffect(() => {
    if (!filterBuilding && selectedTags !== null) {
      urlBuilder(filters, selectedTags);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, selectedTags, workloads, SID]);

  const onSort = (_event, index, direction) => {
    const orderParam = `${direction === 'asc' ? '' : '-'}${sortIndices[index]}`;
    setSortBy({ index, direction });
    setFilters({ ...filters, sort: orderParam, offset: 0 });
  };

  const onSetPage = (pageNumber) => {
    const newOffset = pageNumber * filters.limit - filters.limit;
    setFilters({ ...filters, offset: newOffset });
  };

  const handleOnCollapse = (_e, rowId, isOpen) => {
    const collapseRows = [...rows];
    collapseRows[rowId] = { ...collapseRows[rowId], isOpen };
    setRows(collapseRows);
  };
  const toggleRulesDisabled = (rule_status) => {
    setFilters({
      ...filters,
      rule_status,
      offset: 0,
      ...(rule_status !== 'enabled' && { impacting: ['false'] }),
    });
  };

  const actionResolver = useActionsResolver(
    rows,
    setSelectedRule,
    setDisableRuleOpen,
    refetch
  );

  const impactingFilterDef = impactingFilter(
    setFilters,
    filters,
    hasEdgeDevices
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
      (item) => item[1] === filters.sort || `-${item[1]}` === filters.sort
    );
    if (filters.sort !== undefined && sortIndex) {
      const sortDirection = filters.sort[0] === '-' ? 'desc' : 'asc';
      setSortBy({ index: Number(sortIndex[0]), direction: sortDirection });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.sort]);

  useEffect(() => {
    if (rules.data) {
      if (rules.data.length === 0) {
        setRows(emptyRows(filters, toggleRulesDisabled));
      } else {
        const rows = buildRows(
          rules,
          isAllExpanded,
          setViewSystemsModalRule,
          setViewSystemsModalOpen,
          intl
        );
        setRows(rows);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rules]);

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
    hasEdgeDevices
  );

  const onExpandAllClick = (_e, isOpen) => {
    const allRows = [...rows];
    setIsAllExpanded(isOpen);
    allRows.map((row, key) => {
      if (Object.prototype.hasOwnProperty.call(row, 'isOpen')) {
        allRows[key] = { ...row, isOpen };
      }
    });

    setRows(allRows);
  };

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
        expandAll={{ isAllExpanded, onClick: onExpandAllClick }}
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
        exportConfig={{
          label: intl.formatMessage(messages.exportCsv),
          // eslint-disable-next-line no-dupe-keys
          label: intl.formatMessage(messages.exportJson),
          onSelect: (_e, fileType) =>
            downloadReport(
              'hits',
              fileType,
              filterFetchBuilder(filters),
              selectedTags,
              workloads,
              SID,
              dispatch
            ),
          isDisabled: !permsExport,
          tooltipText: permsExport
            ? intl.formatMessage(messages.exportData)
            : intl.formatMessage(messages.permsAction),
        }}
        filterConfig={{
          items: [
            ...filterConfigItems(
              filters,
              setFilters,
              searchText,
              setSearchText,
              toggleRulesDisabled,
              intl
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
          aria-label={'rule-table'}
          variant={TableVariant.compact}
          actionResolver={actionResolver}
          onCollapse={handleOnCollapse}
          sortBy={sortBy}
          onSort={onSort}
          cells={cols}
          rows={rows}
          areActionsDisabled={() => !permsDisableRec}
          isStickyHeader
          expandId="expand-button"
        >
          <TableHeader />
          <TableBody className="pf-m-width-100" />
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
