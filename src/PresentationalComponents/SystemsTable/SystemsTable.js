import './SystemsTable.scss';

import {
  PERMS,
  SYSTEM_FILTER_CATEGORIES as SFC,
  SYSTEMS_FETCH_URL,
} from '../../AppConstants';
import React, { useEffect, useMemo, useState } from 'react';
import { TableVariant } from '@patternfly/react-table';
import {
  filterFetchBuilder,
  paramParser,
  pruneFilters,
  urlBuilder,
} from '../Common/Tables';
import { useDispatch, useSelector, useStore } from 'react-redux';

import { Get } from '../../Utilities/Api';
import { InventoryTable } from '@redhat-cloud-services/frontend-components/Inventory';
import Loading from '../Loading/Loading';
import SystemsPdf from '../Export/SystemsPdf';
import downloadReport from '../Common/DownloadHelper';
import { mergeArraysByDiffKeys } from '../Common/Tables';
import messages from '../../Messages';
import { systemReducer } from '../../Store/AppReducer';
import { updateReducers } from '../../Store';
import { updateSysFilters } from '../../Services/Filters';
import { useIntl } from 'react-intl';
import { useLocation } from 'react-router-dom';
import { usePermissions } from '@redhat-cloud-services/frontend-components-utilities/RBACHook';
import NoSystemsTable from './Components/NoSystemsTable';
import { systemsTableColumns } from './SystemsTableAssets';
import { createOptions, createSortParam } from '../helper';
import { createColumns } from './createColumns';
import { conditionalFilterType } from '@redhat-cloud-services/frontend-components/ConditionalFilter';

const SystemsTable = () => {
  const intl = useIntl();
  const dispatch = useDispatch();
  const store = useStore();
  const { search } = useLocation();
  const selectedTags = useSelector(({ filters }) => filters.selectedTags);
  const workloads = useSelector(({ filters }) => filters.workloads);
  const SID = useSelector(({ filters }) => filters.SID);
  const filters = useSelector(({ filters }) => filters.sysState);
  const setFilters = (filters) => dispatch(updateSysFilters(filters));
  const permsExport = usePermissions('advisor', PERMS.export).hasAccess;
  const [filterBuilding, setFilterBuilding] = useState(true);

  const removeFilterParam = (param) => {
    const filter = { ...filters, offset: 0 };
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
    const passValue =
      param === SFC.rhel_version.urlParam
        ? Object.values(values || {}).flatMap((majorOsVersion) =>
            Object.keys(majorOsVersion)
          )
        : values;

    passValue.length > 0
      ? setFilters({ ...filters, offset: 0, ...{ [param]: passValue } })
      : removeFilterParam(param);
  };

  const filterConfigItems = [
    {
      label: SFC.hits.title.toLowerCase(),
      type: conditionalFilterType.checkbox,
      id: SFC.hits.urlParam,
      value: `checkbox-${SFC.hits.urlParam}`,
      filterValues: {
        onChange: (_e, values) => addFilterParam(SFC.hits.urlParam, values),
        value: filters.hits,
        items: SFC.hits.values,
      },
    },
    {
      label: SFC.incident.title.toLowerCase(),
      type: conditionalFilterType.checkbox,
      id: SFC.incident.urlParam,
      value: `checkbox-${SFC.incident.urlParam}`,
      filterValues: {
        onChange: (_e, values) => {
          addFilterParam(SFC.incident.urlParam, values);
        },
        value: filters.incident,
        items: SFC.incident.values,
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
        setFilters({
          sort: filters.sort,
          limit: filters.limit,
          offset: filters.offset,
          hits: ['all'],
          tags: selectedTags,
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

  const handleRefresh = (options) => {
    const { display_name, hits } = options;
    const refreshedFilters = {
      ...options,
      ...(display_name && {
        display_name,
      }),
      ...(hits && { hits }),
    };
    urlBuilder(refreshedFilters, selectedTags);
  };

  const columns = systemsTableColumns(intl);

  useEffect(() => {
    let combinedFilters;
    if (search) {
      const paramsObject = paramParser();
      paramsObject.tags = selectedTags;
      paramsObject.sort !== undefined &&
        (paramsObject.sort = paramsObject.sort[0]);
      paramsObject.display_name !== undefined &&
        (paramsObject.display_name = paramsObject.display_name[0]);
      paramsObject.hits === undefined && (paramsObject.hits = ['all']);
      paramsObject.offset === undefined || isNaN(paramsObject.offset)
        ? (paramsObject.offset = 0)
        : (paramsObject.offset = Number(paramsObject.offset[0]));
      paramsObject.limit === undefined || isNaN(paramsObject.limit)
        ? (paramsObject.limit = 20)
        : (paramsObject.limit = Number(paramsObject.limit[0]));
      combinedFilters = { ...filters, ...paramsObject };
      paramsObject.incident !== undefined &&
        !Array.isArray(paramsObject.incident) &&
        (paramsObject.incident = [`${paramsObject.incident}`]);
      setFilters(combinedFilters);
    } else if (
      filters.limit === undefined ||
      filters.offset === undefined ||
      filters.hits === undefined
    ) {
      combinedFilters = {
        ...filters,
        offset: 0,
        limit: 20,
        hits: ['all'],
        tags: selectedTags,
      };
      setFilters(combinedFilters);
    }
    setFilterBuilding(false);
    urlBuilder(combinedFilters, selectedTags);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTags]);
  const pdfFilters = useMemo(() => {
    const { tags: _tags, ...filtersWithoutTags } = filterFetchBuilder(filters);
    return filtersWithoutTags;
  }, [filters]);

  return (
    !filterBuilding && (
      <InventoryTable
        hideFilters={{
          all: true,
          name: false,
          tags: false,
          hostGroupFilter: false,
          operatingSystem: false,
        }}
        initialLoading
        autoRefresh
        showTags
        disableDefaultColumns
        customFilters={{
          advisorFilters: {
            ...filters,
            //Systems table should always be filtered by host type
            'filter[system_profile][host_type][nil]': true,
          },
          workloads,
          SID,
          selectedTags,
        }}
        columns={(defaultColumns) => createColumns(defaultColumns, columns)}
        onLoad={({
          mergeWithEntities,
          INVENTORY_ACTION_TYPES,
          mergeWithDetail,
        }) => {
          store.replaceReducer(
            updateReducers({
              ...mergeWithEntities(systemReducer([], INVENTORY_ACTION_TYPES), {
                page: Number(filters.offset / filters.limit + 1 || 1),
                perPage: Number(filters.limit || 20),
              }),
              ...mergeWithDetail(),
            })
          );
        }}
        getEntities={async (_items, config, showTags, defaultGetEntities) => {
          const {
            per_page,
            page,
            orderBy,
            orderDirection,
            advisorFilters,
            filters,
            workloads,
            SID,
          } = config;
          const sort = createSortParam(orderBy, orderDirection);

          let options = createOptions(
            advisorFilters,
            page,
            per_page,
            sort,
            null,
            filters,
            selectedTags,
            workloads,
            SID,
            true
          );
          const fetchedSystems = (await Get(SYSTEMS_FETCH_URL, {}, options))
            ?.data;

          handleRefresh(options);
          const results = await defaultGetEntities(
            // additional request to fetch hosts' operating system values
            fetchedSystems.data.map((system) => system.system_uuid),
            {
              per_page,
              hasItems: true,
              fields: { system_profile: ['operating_system'] },
            },
            showTags
          );

          return Promise.resolve({
            results: mergeArraysByDiffKeys(
              fetchedSystems.data,
              results.results
            ),
            total: fetchedSystems.meta.count,
          });
        }}
        tableProps={{
          isStickyHeader: true,
          variant: TableVariant.compact,
        }}
        isFullView
        hasCheckbox={false}
        filterConfig={{ items: filterConfigItems }}
        activeFiltersConfig={activeFiltersConfig}
        noSystemsTable={NoSystemsTable}
        exportConfig={{
          onSelect: (_e, fileType) =>
            downloadReport(
              'systems',
              fileType,
              filters,
              selectedTags,
              workloads,
              SID,
              dispatch
            ),
          extraItems: [
            <li
              key="download-pdf"
              className="pf-v5-c-menu__list-item"
              style={{ justifyContent: 'center', display: 'flex' }}
              data-ouia-component-type="PF5/DropdownItem"
              data-ouia-component-id="DownloadPDF"
            >
              <SystemsPdf filters={pdfFilters} />
            </li>,
          ],
          isDisabled: !permsExport,
          tooltipText: permsExport
            ? intl.formatMessage(messages.exportData)
            : intl.formatMessage(messages.permsAction),
        }}
        fallback={Loading}
      />
    )
  );
};

export default SystemsTable;
