import { createOptions } from '../../PresentationalComponents/helper';
import { paginatedRequestHelper } from '../../PresentationalComponents/Inventory/helpers';
import { Post } from '../../Utilities/Api';
import { EDGE_DEVICE_BASE_URL } from '../../AppConstants';
import { useCallback } from 'react';
import { systemReducer } from '../../Store/AppReducer';
import { updateReducers } from '../../Store';
import { useStore } from 'react-redux';
import { wrappable } from '@patternfly/react-table';

const mergeByInventoryKey = (
  advisorData = [],
  inventoryData = [],
  edgeData = [],
  enforceEdgeGroups
) => {
  return inventoryData.map((inventory) => {
    const edge = edgeData.find((device) => device.DeviceUUID === inventory.id);
    const advisor = advisorData.find(
      (advisor) => advisor.system_uuid === inventory.id
    );

    return {
      ...inventory,
      ...advisor,
      ...edge,
      groups: enforceEdgeGroups
        ? edge.DeviceGroups?.map((group) => ({
            id: group.ID,
            name: group.Name,
          })) || []
        : inventory.groups,
    };
  });
};

export const useGetEntities =
  (handleRefresh, pathway, rule) =>
  async (_items, config, showTags, defaultGetEntities) => {
    const {
      per_page,
      page,
      orderBy,
      orderDirection,
      advisorFilters,
      filters,
      workloads,
      SID,
      selectedTags,
    } = config;
    //operating_system is currently not supported, but will be down the line.
    const sort =
      orderBy === 'operating_system'
        ? 'rhel_version'
        : `${orderDirection === 'ASC' ? '' : '-'}${
            orderBy === 'updated' ? 'last_seen' : orderBy
          }`;

    let options = createOptions(
      advisorFilters,
      page,
      per_page,
      sort,
      pathway,
      filters,
      selectedTags,
      workloads,
      SID
    );
    handleRefresh(options);
    const allDetails = { ...config, pathway, rule, sort };
    const advisorData = await paginatedRequestHelper(allDetails);
    const systemIDs = advisorData?.data?.map((system) => system.system_uuid);

    const inventoryData = await defaultGetEntities(
      systemIDs,
      {
        per_page,
        hasItems: true,
        fields: { system_profile: ['operating_system'] },
      },
      showTags
    );

    let edgeData = [];
    let enforceEdgeGroups = false;
    if (systemIDs?.length) {
      const { data: devicesData } = await Post(
        `${EDGE_DEVICE_BASE_URL}/devices/devicesview`,
        {},
        { devices_uuid: systemIDs }
      );

      edgeData = devicesData?.data?.devices || [];
      enforceEdgeGroups = devicesData?.data?.enforce_edge_groups;
    }

    const fullData = mergeByInventoryKey(
      advisorData.data,
      inventoryData.results,
      edgeData,
      enforceEdgeGroups
    );

    return Promise.resolve({
      results: fullData,
      total: advisorData.meta.count,
    });
  };

export const useActionResolver = (handleModalToggle) =>
  useCallback(
    () => [
      {
        title: 'Disable recommendation for system',
        onClick: (event, rowIndex, item) => handleModalToggle(true, item),
      },
    ],
    []
  );

export const useOnLoad = (filters) => {
  const store = useStore();
  return useCallback(
    ({ mergeWithEntities, INVENTORY_ACTION_TYPES, mergeWithDetail }) => {
      store.replaceReducer(
        updateReducers({
          ...mergeWithEntities(systemReducer([], INVENTORY_ACTION_TYPES), {
            page: Number(filters.offset / filters.limit + 1 || 1),
            perPage: Number(filters.limit || 20),
          }),
          ...mergeWithDetail(),
        })
      );
    },
    [filters, store]
  );
};

export const mergeAppColumns = (defaultColumns, isRecommendationDetail) => {
  const lastSeenColumn = defaultColumns.find(({ key }) => key === 'updated');
  const impacted_date = {
    key: 'impacted_date',
    title: 'First Impacted',
    sortKey: 'impacted_date',
    transforms: [wrappable],
    props: { width: 15 },
    renderFunc: lastSeenColumn.renderFunc,
  };

  //disable sorting on OS. API does not handle this
  const osColumn = defaultColumns.find(({ key }) => key === 'system_profile');
  osColumn.props = { ...osColumn.props, isStatic: true };

  //disable sorting on GROUPS. API does not handle this
  const groupsColumn = defaultColumns.find(({ key }) => key === 'groups');
  groupsColumn.props = { ...groupsColumn.props, isStatic: true };

  return [
    ...defaultColumns,
    ...(isRecommendationDetail ? [impacted_date] : []),
  ];
};
