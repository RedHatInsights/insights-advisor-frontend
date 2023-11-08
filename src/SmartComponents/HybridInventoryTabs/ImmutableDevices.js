import React, { useState } from 'react';
import { SYSTEM_FILTER_CATEGORIES as SFC } from '../../AppConstants';
import { sortable, wrappable } from '@patternfly/react-table';
import {
  pruneFilters,
  urlBuilder,
} from '../../PresentationalComponents/Common/Tables';
import { useStore } from 'react-redux';
import { getEntities } from './helpers';
import PropTypes from 'prop-types';
import {} from '../../AppConstants';
import messages from '../../Messages';
import { systemReducer } from '../../Store/AppReducer';
import { updateReducers } from '../../Store';
import { useIntl } from 'react-intl';
import AsynComponent from '@redhat-cloud-services/frontend-components/AsyncComponent';
import { useFeatureFlag } from '../../Utilities/Hooks';
import { useNavigate } from 'react-router-dom';

const ImmutableDevices = ({ rule, pathway, selectedTags }) => {
  const store = useStore();
  const intl = useIntl();
  const navigate = useNavigate();
  const isEdgeParityEnabled = useFeatureFlag('advisor.edge_parity');
  const [filters, setFilters] = useState({
    limit: 20,
    offset: 0,
    sort: '-last_seen',
    name: '',
    ...(isEdgeParityEnabled
      ? { 'filter[system_profile][host_type]': 'edge' }
      : {}),
  });

  const handleRefresh = (options) => {
    const { name, display_name } = options;
    const refreshedFilters = {
      ...options,
      ...(name && {
        name,
      }),
      ...(display_name && {
        display_name,
      }),
    };
    !pathway && urlBuilder(refreshedFilters, selectedTags);
  };

  const fetchSystems = getEntities(handleRefresh, pathway, rule);

  const removeFilterParam = (param) => {
    const filter = { ...filters, offset: 0 };
    delete filter[param];
    setFilters(filter);
  };

  const buildFilterChips = () => {
    const localFilters = { ...filters };
    delete localFilters.sort;
    delete localFilters.offset;
    delete localFilters.limit;

    return pruneFilters(localFilters, SFC);
  };

  const activeFiltersConfig = {
    deleteTitle: intl.formatMessage(messages.resetFilters),
    filters: buildFilterChips(),
    onDelete: (_e, itemsToRemove, isAll) => {
      if (isAll) {
        setFilters({
          sort: filters.sort,
          limit: filters.limit,
          offset: filters.offset,
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

  const mergeAppColumns = (defaultColumns) => {
    const lastSeenColumn = defaultColumns.find(({ key }) => key === 'updated');
    const impacted_date = {
      key: 'impacted_date',
      title: 'First Impacted',
      sortKey: 'impacted_date',
      transforms: [sortable, wrappable],
      props: { width: 15 },
      renderFunc: lastSeenColumn.renderFunc,
    };

    //disable sorting on OS. API does not handle this
    const osColumn = defaultColumns.find(({ key }) => key === 'system_profile');
    osColumn.props = { isStatic: true };

    return [...defaultColumns, impacted_date];
  };

  const onSystemNameClick = (_key, systemId) => {
    navigate(`/insights/inventory/${systemId}?appName=advisor`);
  };

  return (
    <AsynComponent
      appName="inventory"
      module="./ImmutableDevices"
      fallback={<div />}
      store={store}
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
      key="inventory"
      customFilters={{
        advisorFilters: filters,
      }}
      getEntities={fetchSystems}
      showActions={false}
      hideFilters={{
        all: true,
        name: false,
        operatingSystem: false,
      }}
      noSystemsTable={<div />}
      mergeAppColumns={mergeAppColumns}
      activeFiltersConfig={activeFiltersConfig}
      onRowClick={onSystemNameClick}
    />
  );
};

ImmutableDevices.propTypes = {
  tableProps: PropTypes.any,
  rule: PropTypes.object,
  afterDisableFn: PropTypes.func,
  pathway: PropTypes.object,
  selectedTags: PropTypes.any,
  workloads: PropTypes.any,
  SID: PropTypes.any,
  permsExport: PropTypes.bool,
  exportTable: PropTypes.string,
  showTags: PropTypes.bool,
};
export default ImmutableDevices;
