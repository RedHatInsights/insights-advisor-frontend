import instance from '@redhat-cloud-services/frontend-components-utilities/interceptors';
import { BASE_URL } from '../../AppConstants';

export const fetchRecs = async (params = {}) => {
  const { pagination, filters, sort, ...rest } = params;

  const flatParams = {
    ...pagination,
    ...filters,
    ...rest,
  };

  if (sort) {
    flatParams.sort = sort;
  }

  const queryParams = new URLSearchParams();

  Object.entries(flatParams).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (Array.isArray(value)) {
        value.forEach((v) => queryParams.append(key, v));
      } else {
        queryParams.append(key, value);
      }
    }
  });

  const url = `${BASE_URL}/rule/?${queryParams.toString()}`;
  const response = await instance.get(url);

  if (response.data?.data && response.data?.meta) {
    return {
      data: response.data.data.map((item) => ({
        ...item,
        itemId: item.rule_id,
      })),
      meta: response.data.meta,
    };
  }

  if (Array.isArray(response.data) && response.meta) {
    return {
      data: response.data.map((item) => ({
        ...item,
        itemId: item.rule_id,
      })),
      meta: {
        count: response.meta.count,
        total: response.meta.count,
      },
    };
  }

  if (Array.isArray(response.data)) {
    return {
      data: response.data,
      meta: { count: response.data.length },
    };
  }

  return response.data;
};
