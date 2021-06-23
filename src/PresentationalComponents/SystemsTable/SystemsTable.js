import './SystemsTable.scss';

import * as AppActions from '../../AppActions';

import {
  DEBOUNCE_DELAY,
  PERMS,
  SYSTEM_FILTER_CATEGORIES as SFC,
} from '../../AppConstants';
import React, { useEffect, useRef, useState } from 'react';
import { TableVariant, sortable, wrappable } from '@patternfly/react-table';
import {
  filterFetchBuilder,
  paramParser,
  pruneFilters,
  urlBuilder,
  workloadQueryBuilder,
} from '../Common/Tables';
import { useDispatch, useSelector } from 'react-redux';

import Failed from '../Loading/Failed';
import { InventoryTable } from '@redhat-cloud-services/frontend-components/Inventory';
import Loading from '../Loading/Loading';
import SystemsPdf from '../Export/SystemsPdf';
import debounce from '../../Utilities/Debounce';
import downloadReport from '../Common/DownloadHelper';
import { getRegistry } from '@redhat-cloud-services/frontend-components-utilities/Registry';
import messages from '../../Messages';
import { systemReducer } from '../../AppReducer';
import { useIntl } from 'react-intl';
import { useLocation } from 'react-router-dom';
import { usePermissions } from '@redhat-cloud-services/frontend-components-utilities/RBACHook';

const SystemsTable = () => {
  const intl = useIntl();
  const dispatch = useDispatch();
  const { search } = useLocation();

  const systems = useSelector(({ AdvisorStore }) => AdvisorStore.systems);
  const systemsFetchStatus = useSelector(
    ({ AdvisorStore }) => AdvisorStore.systemsFetchStatus
  );
  const filters = useSelector(
    ({ AdvisorStore }) => AdvisorStore.filtersSystems
  );
  const selectedTags = useSelector(
    ({ AdvisorStore }) => AdvisorStore.selectedTags
  );
  const workloads = useSelector(({ AdvisorStore }) => AdvisorStore.workloads);
  const SID = useSelector(({ AdvisorStore }) => AdvisorStore.SID);

  const setFilters = (filters) =>
    dispatch(AppActions.setFiltersSystems(filters));

  const permsExport = usePermissions('advisor', PERMS.export).hasAccess;
  const inventory = useRef(null);
  const results = systems.meta ? systems.meta.count : 0;
  const [searchText, setSearchText] = useState(filters.display_name || '');
  const debouncedSearchText = debounce(searchText, DEBOUNCE_DELAY);
  const [filterBuilding, setFilterBuilding] = useState(true);
  const sortIndices = {
    0: 'display_name',
    2: 'hits',
    3: 'critical_hits',
    4: 'important_hits',
    5: 'moderate_hits',
    6: 'low_hits',
    7: 'last_seen',
  };

  const columns = [
    {
      title: intl.formatMessage(messages.numberRuleHits),
      transforms: [sortable, wrappable],
      key: 'hits',
    },
    {
      title: intl.formatMessage(messages.critical),
      transforms: [sortable, wrappable],
      key: 'critical_hits',
    },
    {
      title: intl.formatMessage(messages.important),
      transforms: [sortable, wrappable],
      key: 'important_hits',
    },
    {
      title: intl.formatMessage(messages.moderate),
      transforms: [sortable, wrappable],
      key: 'moderate_hits',
    },
    {
      title: intl.formatMessage(messages.low),
      transforms: [sortable, wrappable],
      key: 'low_hits',
    },
  ];

  const onSort = ({ index, direction }) => {
    const orderParam = `${direction === 'asc' ? '' : '-'}${sortIndices[index]}`;
    setFilters({ ...filters, sort: orderParam, offset: 0 });
  };

  const fetchSystemsFn = () => {
    const fetchSystemsAction = (url) => dispatch(AppActions.fetchSystems(url));
    urlBuilder(filters, selectedTags);
    let options = selectedTags.length && { tags: selectedTags };
    workloads &&
      (options = { ...options, ...workloadQueryBuilder(workloads, SID) });

    return fetchSystemsAction({ ...filterFetchBuilder(filters), ...options });
  };

  const removeFilterParam = (param) => {
    const filter = { ...filters, offset: 0 };
    param === 'text' && setSearchText('');
    delete filter[param];
    param === 'hits' && filter.hits === undefined && (filter.hits = ['yes']);
    setFilters(filter);
  };

  const addFilterParam = (param, values) => {
    // remove 'yes' from the hits filter if the user chooses any other filters (its always the first item)
    param === 'hits' &&
      values.length > 1 &&
      values.includes('yes') &&
      values.shift();
    values.length > 0
      ? setFilters({ ...filters, offset: 0, ...{ [param]: values } })
      : removeFilterParam(param);
  };

  const filterConfigItems = [
    {
      label: intl.formatMessage(messages.name).toLowerCase(),
      filterValues: {
        key: 'text-filter',
        onChange: (event, value) => setSearchText(value),
        value: searchText,
      },
    },
    {
      label: SFC.hits.title.toLowerCase(),
      type: SFC.hits.type,
      id: SFC.hits.urlParam,
      value: `checkbox-${SFC.hits.urlParam}`,
      filterValues: {
        key: `${SFC.hits.urlParam}-filter`,
        onChange: (event, values) => addFilterParam(SFC.hits.urlParam, values),
        value: filters.hits,
        items: SFC.hits.values,
      },
    },
  ];

  const buildFilterChips = () => {
    const localFilters = { ...filters };
    localFilters.hits &&
      localFilters.hits.includes('yes') &&
      delete localFilters.hits;
    delete localFilters.sort;
    delete localFilters.offset;
    delete localFilters.limit;

    return pruneFilters(localFilters, SFC);
  };

  const activeFiltersConfig = {
    deleteTitle: intl.formatMessage(messages.resetFilters),
    filters: buildFilterChips(),
    onDelete: (event, itemsToRemove, isAll) => {
      if (isAll) {
        setSearchText('');
        setFilters({
          sort: filters.sort,
          limit: filters.limit,
          offset: filters.offset,
          hits: ['yes'],
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
            : removeFilterParam(item.urlParam);
        });
      }
    },
  };

  const handleRefresh = ({ page, per_page }) => {
    if (systemsFetchStatus === 'fulfilled') {
      const { offset, limit } = filters;
      const newOffset = page * per_page - per_page;
      if (newOffset !== offset || limit !== per_page) {
        setFilters({
          ...filters,
          limit: per_page,
          offset: page * per_page - per_page,
        });
      }
    }
  };

  const calculateSort = () => {
    const sortIndex = Number(
      Object.entries(sortIndices)?.find(
        (item) => item[1] === filters.sort || `-${item[1]}` === filters.sort
      )[0]
    );
    const sortDirection = filters.sort[0] === '-' ? 'desc' : 'asc';
    return {
      index: sortIndex,
      key: sortIndex !== 7 ? sortIndices[sortIndex] : 'last_seen',
      direction: sortDirection,
    };
  };

  const createColumns = (defaultColumns) => {
    let lastSeenColumn = defaultColumns.filter(({ key }) => key === 'updated');
    let displayName = defaultColumns.filter(
      ({ key }) => key === 'display_name'
    );
    let systemProfile = defaultColumns.filter(
      ({ key }) => key === 'system_profile'
    );

    displayName = {
      ...displayName[0],
      transforms: [sortable, wrappable],
      props: { isStatic: true },
    };

    lastSeenColumn = {
      ...lastSeenColumn[0],
      transforms: [sortable, wrappable],
      props: { width: 20 },
    };

    systemProfile = {
      ...systemProfile[0],
      transforms: [wrappable],
    };

    return [displayName, systemProfile, ...columns, lastSeenColumn];
  };

  useEffect(() => {
    filters.display_name === undefined
      ? setSearchText('')
      : setSearchText(filters.display_name);
  }, [filters.display_name]);

  useEffect(() => {
    if (!filterBuilding && systemsFetchStatus !== 'pending') {
      const copyFilters = { ...filters };
      delete copyFilters.display_name;
      setFilters({
        ...copyFilters,
        ...(searchText.length ? { display_name: searchText } : {}),
        offset: 0,
      });
    }
  }, [debouncedSearchText]);

  useEffect(() => {
    if (search && filterBuilding) {
      const paramsObject = paramParser();
      delete paramsObject.tags;

      paramsObject.sort !== undefined &&
        (paramsObject.sort = paramsObject.sort[0]);
      paramsObject.display_name !== undefined &&
        (paramsObject.display_name = paramsObject.display_name[0]);
      paramsObject.hits === undefined && (paramsObject.hits = ['all']);
      paramsObject.offset === undefined
        ? (paramsObject.offset = 0)
        : (paramsObject.offset = Number(paramsObject.offset[0]));
      paramsObject.limit === undefined
        ? (paramsObject.limit = 20)
        : (paramsObject.limit = Number(paramsObject.limit[0]));
      setFilters({ ...filters, ...paramsObject });
    } else if (
      filters.limit === undefined ||
      filters.offset === undefined ||
      filters.hits === undefined
    ) {
      setFilters({ ...filters, offset: 0, limit: 20, hits: ['all'] });
    }

    setFilterBuilding(false);
    fetchSystemsFn();
  }, []);

  useEffect(() => {
    if (systemsFetchStatus !== 'pending') {
      fetchSystemsFn();
    }
  }, [filters]);

  const page = filters.offset / filters.limit + 1;
  const sort = calculateSort();
  return systemsFetchStatus !== 'failed' ? (
    <InventoryTable
      disableDefaultColumns
      columns={(defaultColumns) => createColumns(defaultColumns)}
      onLoad={({
        mergeWithEntities,
        INVENTORY_ACTION_TYPES,
        mergeWithDetail,
      }) => {
        getRegistry().register({
          ...mergeWithEntities(systemReducer(columns, INVENTORY_ACTION_TYPES), {
            page: page || 1,
            perPage: filters.limit || 20,
            ...sort,
          }),
          ...mergeWithDetail(),
        });
      }}
      getEntities={(_items, { per_page, itemsPage }) => {
        handleRefresh({ page: itemsPage, per_page });
        return Promise.resolve({
          results: columns,
          total: results,
        });
      }}
      tableProps={{
        isStickyHeader: true,
        variant: TableVariant.compact,
      }}
      ref={inventory}
      items={((systemsFetchStatus !== 'pending' && systems?.data) || []).map(
        (system) => ({
          ...system,
          id: system.system_uuid,
        })
      )}
      isFullView
      sortBy={sort}
      onSort={onSort}
      hasCheckbox={false}
      page={page}
      total={results}
      isLoaded={systemsFetchStatus === 'fulfilled'}
      perPage={Number(filters.limit)}
      filterConfig={{ items: filterConfigItems }}
      activeFiltersConfig={activeFiltersConfig}
      exportConfig={{
        onSelect: (_e, fileType) =>
          downloadReport(
            'systems',
            fileType,
            filters,
            selectedTags,
            workloads,
            SID
          ),
        extraItems: [
          <li key="download-pd" role="menuitem">
            <SystemsPdf filters={{ ...filterFetchBuilder(filters) }} />
          </li>,
        ],
        isDisabled: !permsExport,
        tooltipText: permsExport
          ? intl.formatMessage(messages.exportData)
          : intl.formatMessage(messages.permsAction),
      }}
      fallback={Loading}
    />
  ) : (
    systemsFetchStatus === 'failed' && (
      <Failed message={intl.formatMessage(messages.systemTableFetchError)} />
    )
  );
};

export default SystemsTable;
