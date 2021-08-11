import './SystemsTable.scss';

import * as AppActions from '../../Store/AppActions';

import {
  PERMS,
  SYSTEM_FILTER_CATEGORIES as SFC,
  SYSTEMS_FETCH_URL,
} from '../../AppConstants';
import React, { useEffect, useState } from 'react';
import { TableVariant, sortable, wrappable } from '@patternfly/react-table';
import {
  filterFetchBuilder,
  paramParser,
  pruneFilters,
  urlBuilder,
  workloadQueryBuilder,
} from '../Common/Tables';
import { useDispatch, useSelector } from 'react-redux';

import API from '../../Utilities/Api';
import { InventoryTable } from '@redhat-cloud-services/frontend-components/Inventory';
import { Link } from 'react-router-dom';
import Loading from '../Loading/Loading';
import RuleLabels from '../RuleLabels/RuleLabels';
import SystemsPdf from '../Export/SystemsPdf';
import downloadReport from '../Common/DownloadHelper';
import { getRegistry } from '@redhat-cloud-services/frontend-components-utilities/Registry';
import { mergeArraysByDiffKeys } from '../Common/Tables';
import messages from '../../Messages';
import { systemReducer } from '../../Store/AppReducer';
import { useIntl } from 'react-intl';
import { useLocation } from 'react-router-dom';
import { usePermissions } from '@redhat-cloud-services/frontend-components-utilities/RBACHook';

const SystemsTable = () => {
  const intl = useIntl();
  const dispatch = useDispatch();
  const { search } = useLocation();
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
  const [filterBuilding, setFilterBuilding] = useState(true);
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
    values.length > 0
      ? setFilters({ ...filters, offset: 0, ...{ [param]: values } })
      : removeFilterParam(param);
  };
  const filterConfigItems = [
    {
      label: SFC.hits.title.toLowerCase(),
      type: SFC.hits.type,
      id: SFC.hits.urlParam,
      value: `checkbox-${SFC.hits.urlParam}`,
      filterValues: {
        key: `${SFC.hits.urlParam}-filter`,
        onChange: (_e, values) => addFilterParam(SFC.hits.urlParam, values),
        value: filters.hits,
        items: SFC.hits.values,
      },
    },
    {
      label: SFC.incident.title.toLowerCase(),
      type: SFC.incident.type,
      id: SFC.incident.urlParam,
      value: `checkbox-${SFC.incident.urlParam}`,
      filterValues: {
        key: `${SFC.incident.urlParam}-filter`,
        onChange: (_e, values) => {
          addFilterParam(SFC.incident.urlParam, values);
        },
        value: filters.incident,
        items: SFC.incident.values,
      },
    },
    {
      label: SFC.rhel_version.title.toLowerCase(),
      type: SFC.rhel_version.type,
      id: SFC.rhel_version.urlParam,
      value: `checkbox-${SFC.rhel_version.urlParam}`,
      filterValues: {
        key: `${SFC.rhel_version.urlParam}-filter`,
        onChange: (_e, values) => {
          addFilterParam(SFC.rhel_version.urlParam, values);
        },
        value: filters.rhel_version,
        items: SFC.rhel_version.values,
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
      // eslint-disable-next-line react/display-name
      renderFunc: (_data, _id, system) => (
        <React.Fragment>
          <Link key={_id} to={`/systems/${system.system_uuid}`}>
            {`${system.display_name} `}
          </Link>
          {system.incident_hits > 0 && (
            <RuleLabels rule={{ tags: 'incident' }} />
          )}
        </React.Fragment>
      ),
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
    let combinedFitlers;
    if (search) {
      const paramsObject = paramParser();
      delete paramsObject.tags;
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
      combinedFitlers = { ...filters, ...paramsObject };
      paramsObject.incident !== undefined &&
        !Array.isArray(paramsObject.incident) &&
        (paramsObject.incident = [`${paramsObject.incident}`]);
      setFilters(combinedFitlers);
    } else if (
      filters.limit === undefined ||
      filters.offset === undefined ||
      filters.hits === undefined
    ) {
      combinedFitlers = {
        ...filters,
        offset: 0,
        limit: 20,
        hits: ['all'],
      };
      setFilters(combinedFitlers);
    }
    setFilterBuilding(false);
    urlBuilder(combinedFitlers, selectedTags);
  }, []);

  return (
    !filterBuilding && (
      <InventoryTable
        hideFilters={{ all: true, name: false }}
        initialLoading
        autoRefresh
        disableDefaultColumns
        customFilters={{
          advisorFilters: filters,
          selectedTags,
          workloads,
          SID,
        }}
        columns={(defaultColumns) => createColumns(defaultColumns)}
        onLoad={({
          mergeWithEntities,
          INVENTORY_ACTION_TYPES,
          mergeWithDetail,
        }) => {
          getRegistry().register({
            ...mergeWithEntities(systemReducer([], INVENTORY_ACTION_TYPES), {
              page: Number(filters.offset / filters.limit + 1 || 1),
              perPage: Number(filters.limit || 20),
            }),
            ...mergeWithDetail(),
          });
        }}
        getEntities={async (_items, config, showTags, defaultGetEntities) => {
          const {
            per_page,
            page,
            orderBy,
            orderDirection,
            advisorFilters,
            selectedTags,
            workloads,
            SID,
          } = config;
          const sort = `${orderDirection === 'ASC' ? '' : '-'}${
            orderBy === 'updated' ? 'last_seen' : orderBy
          }`;

          let options = {
            ...advisorFilters,
            limit: per_page,
            offset: page * per_page - per_page,
            sort,
            ...(config.filters.hostnameOrId && {
              display_name: config?.filters?.hostnameOrId,
            }),
            ...(Array.isArray(advisorFilters.incident) && {
              incident: advisorFilters?.incident?.join(','),
            }),
            ...(Array.isArray(advisorFilters.rhel_version) && {
              rhel_version: advisorFilters.rhel_version?.join(','),
            }),
            ...(selectedTags.length && { tags: selectedTags }),
          };

          workloads &&
            (options = { ...options, ...workloadQueryBuilder(workloads, SID) });

          const fetchedSystems = (await API.get(SYSTEMS_FETCH_URL, {}, options))
            ?.data;

          handleRefresh(options);
          const results = await defaultGetEntities(
            fetchedSystems.data.map((system) => system.system_uuid),
            {
              page,
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
    )
  );
};

export default SystemsTable;
