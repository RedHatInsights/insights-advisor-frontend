import './_RulesTable.scss';
import * as AppConstants from '../../AppConstants';
import { DEBOUNCE_DELAY, FILTER_CATEGORIES as FC } from '../../AppConstants';
import { useLocation } from 'react-router-dom';
import {
  Pagination,
  PaginationVariant,
} from '@patternfly/react-core/dist/esm/components/Pagination/Pagination';
import React, { useEffect, useState } from 'react';

import {
  Table,
  TableBody,
  TableHeader,
  TableVariant,
  cellWidth,
  fitContent,
  sortable,
} from '@patternfly/react-table';

import {
  filterFetchBuilder,
  pruneFilters,
  urlBuilder,
  workloadQueryBuilder,
} from '../Common/Tables';
import { useDispatch, useSelector } from 'react-redux';

import DisableRule from '../Modals/DisableRule';
import { ErrorState } from '@redhat-cloud-services/frontend-components/ErrorState';
import Loading from '../../PresentationalComponents/Loading/Loading';
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

import {
  buildRows,
  emptyRows,
  filterConfigItems,
  hideReports,
  removeFilterParam,
  urlFilterBuilder,
} from './helpers';

const RulesTable = ({ isTabActive }) => {
  const intl = useIntl();
  const dispatch = useDispatch();
  const { search } = useLocation();
  const permsExport = usePermissions(
    'advisor',
    AppConstants.PERMS.export
  ).hasAccess;
  const permsDisableRec = usePermissions(
    'advisor',
    AppConstants.PERMS.disableRec
  ).hasAccess;
  const [cols] = useState([
    {
      title: intl.formatMessage(messages.name),
      transforms: [sortable, cellWidth(40)],
    },
    {
      title: intl.formatMessage(messages.modified),
      transforms: [sortable, fitContent],
    },
    {
      title: intl.formatMessage(messages.category),
      transforms: [sortable, fitContent],
    },
    {
      title: intl.formatMessage(messages.totalRisk),
      transforms: [sortable, fitContent],
    },
    {
      title: intl.formatMessage(messages.systems),
      transforms: [sortable, fitContent],
    },
    {
      title: intl.formatMessage(messages.remediation),
      transforms: [sortable, fitContent],
    },
  ]);

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

  let options = {};
  selectedTags?.length &&
    (options = {
      ...options,
      ...{ tags: selectedTags.join(',') },
    });
  workloads &&
    (options = { ...options, ...workloadQueryBuilder(workloads, SID) });

  const {
    data: rules = [],
    isFetching,
    isLoading,
    isError,
    refetch,
  } = useGetRecsQuery({ ...filterFetchBuilder(filters), ...options });

  const debouncedSearchText = debounce(searchText, DEBOUNCE_DELAY);
  const results = rules?.meta?.count || 0;
  const sortIndices = {
    1: 'description',
    2: 'publish_date',
    3: 'category',
    4: 'total_risk',
    5: 'impacted_count',
    6: 'playbook_count',
  };

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

  const actionResolver = (rowData, { rowIndex }) => {
    const rule = rows[rowIndex].rule ? rows[rowIndex].rule : null;
    if (rowIndex % 2 !== 0 || !rule) {
      return null;
    }

    return rule && rule.rule_status === 'enabled'
      ? [
          {
            title: intl.formatMessage(messages.disableRule),
            onClick: (_event, rowId) =>
              hideReports(
                rowId,
                rows,
                setSelectedRule,
                setDisableRuleOpen,
                refetch,
                dispatch,
                intl
              ),
          },
        ]
      : [
          {
            title: intl.formatMessage(messages.enableRule),
            onClick: (_event, rowId) =>
              hideReports(
                rowId,
                rows,
                setSelectedRule,
                setDisableRuleOpen,
                refetch,
                dispatch,
                intl
              ),
          },
        ];
  };

  const buildFilterChips = () => {
    const localFilters = { ...filters };
    delete localFilters.topic;
    delete localFilters.sort;
    delete localFilters.offset;
    delete localFilters.limit;

    return pruneFilters(localFilters, FC);
  };

  // Builds table filters from url params
  useEffect(() => {
    if (isTabActive && search && filterBuilding) {
      urlFilterBuilder(sortIndices, setSearchText, setFilters, filters);
    }

    setFilterBuilding(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const activeFiltersConfig = {
    deleteTitle: intl.formatMessage(messages.resetFilters),
    filters: buildFilterChips(),
    showDeleteButton: true,
    onDelete: (_event, itemsToRemove, isAll) => {
      if (isAll) {
        setSearchText('');
        setFilters({
          ...(filters.topic && { topic: filters.topic }),
          impacting: ['true'],
          rule_status: 'enabled',
          limit: filters.limit,
          offset: filters.offset,
          pathway: filters.pathway,
        });
      } else {
        itemsToRemove.map((item) => {
          const newFilter = {
            [item.urlParam]: Array.isArray(filters[item.urlParam])
              ? filters[item.urlParam].filter(
                  (value) => String(value) !== String(item.chips[0].value)
                )
              : '',
          };
          newFilter[item.urlParam].length > 0
            ? setFilters({ ...filters, ...newFilter })
            : removeFilterParam(
                item.urlParam,
                filters,
                setFilters,
                setSearchText
              );
        });
      }
    },
  };

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
              filters,
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
          items: filterConfigItems(
            filters,
            setFilters,
            searchText,
            setSearchText,
            toggleRulesDisabled,
            intl
          ),
        }}
        activeFiltersConfig={activeFiltersConfig}
      />
      {isFetching ? (
        <Loading />
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
    </React.Fragment>
  );
};

RulesTable.propTypes = {
  isTabActive: PropTypes.bool,
};

export default RulesTable;
