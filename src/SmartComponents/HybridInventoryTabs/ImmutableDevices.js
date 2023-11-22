import React, { useState } from 'react';
import { SYSTEM_FILTER_CATEGORIES as SFC } from '../../AppConstants';
import {
  pruneFilters,
  urlBuilder,
} from '../../PresentationalComponents/Common/Tables';
import { useStore } from 'react-redux';
import {
  useGetEntities,
  useActionResolver,
  useOnLoad,
  mergeAppColumns,
} from './helpers';
import PropTypes from 'prop-types';
import messages from '../../Messages';
import { useIntl } from 'react-intl';
import AsynComponent from '@redhat-cloud-services/frontend-components/AsyncComponent';
import { useNavigate } from 'react-router-dom';

const ImmutableDevices = ({
  rule,
  pathway,
  selectedTags,
  handleModalToggle,
  isRecommendationDetail,
}) => {
  const store = useStore();
  const intl = useIntl();
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    limit: 20,
    offset: 0,
    sort: '-last_seen',
    name: '',
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

  const fetchSystems = useGetEntities(handleRefresh, pathway, rule);

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

  const onSystemNameClick = (_key, systemId) => {
    navigate(`/insights/inventory/${systemId}?appName=advisor`);
  };

  const actionResolver = useActionResolver(handleModalToggle);
  const onLoad = useOnLoad(filters);

  return (
    <AsynComponent
      appName="inventory"
      module="./ImmutableDevices"
      fallback={<div />}
      store={store}
      onLoad={onLoad}
      key="inventory"
      customFilters={{
        advisorFilters: {
          ...filters,
          //Immutable devices table should always be filtered by host_type=edge
          'filter[system_profile][host_type]': 'edge',
        },
      }}
      getEntities={fetchSystems}
      showActions={false}
      hideFilters={{
        all: true,
        name: false,
        operatingSystem: false,
        tags: false,
      }}
      mergeAppColumns={mergeAppColumns}
      activeFiltersConfig={activeFiltersConfig}
      onRowClick={onSystemNameClick}
      {...(isRecommendationDetail ? { tableActions: actionResolver } : {})}
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
  handleModalToggle: PropTypes.func,
  isRecommendationDetail: PropTypes.bool,
};
export default ImmutableDevices;
