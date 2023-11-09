import { createOptions } from '../../PresentationalComponents/helper';
import { paginatedRequestHelper } from '../../PresentationalComponents/Inventory/helpers';
import { mergeArraysByDiffKeys } from '../../PresentationalComponents/Common/Tables';
import { Post } from '../../Utilities/Api';
import { EDGE_DEVICE_BASE_URL } from '../../AppConstants';

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

    let fullData = [];
    if (systemIDs?.length) {
      const { data: devicesData } = await Post(
        `${EDGE_DEVICE_BASE_URL}/devices/devicesview`,
        {},
        { devices_uuid: systemIDs }
      );
      fullData = devicesData?.data?.devices?.map((device) => {
        const system = inventoryData.results.find(
          (system) => device.DeviceUUID === system.id
        );
        return {
          ...system,
          ...device,
        };
      });
    }

    return Promise.resolve({
      results: mergeArraysByDiffKeys(advisorData.data, fullData),
      total: advisorData.meta.count,
    });
  };
