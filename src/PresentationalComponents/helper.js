import { buildTagFilter, workloadQueryBuilder } from './Common/Tables';
import { orderBy } from 'lodash';
import { exportNotifications } from '../AppConstants';

export const buildOsFilter = (osFilter = {}) => {
  const osVersions = Object.entries(osFilter)
    .reduce((acc, [, osGroupValues]) => {
      return [
        ...acc,
        ...Object.entries(osGroupValues)
          .filter(([, value]) => value === true)
          .map(([key]) => {
            const keyParts = key.split('-');
            const version = keyParts[keyParts.length - 1];

            return version.includes('.') ? version : undefined;
          }),
      ];
    }, [])
    .filter((v) => !!v);

  return osVersions;
};

export const createOptions = (
  advisorFilters,
  page,
  per_page,
  sort,
  pathway,
  filters,
  selectedTags,
  workloads,
  SID,
  systemsPage,
) => {
  const osFilter = filters.osFilter && buildOsFilter(filters.osFilter);
  // RHINENG-11227: remove system incident filter if it has multiple elements, which will be both
  // 'true' and 'false', because it will result in a 400 BadRequest from the API
  advisorFilters.incident?.length > 1 && delete advisorFilters.incident;
  const options = {
    ...advisorFilters,
    limit: per_page,
    offset: page * per_page - per_page,
    sort: sort,
    ...(filters?.hostnameOrId &&
      !pathway &&
      !systemsPage && {
        name: filters?.hostnameOrId,
      }),
    ...(filters?.hostnameOrId &&
      !pathway &&
      systemsPage && {
        display_name: filters?.hostnameOrId,
      }),
    ...(filters.hostnameOrId &&
      pathway && {
        display_name: filters?.hostnameOrId,
      }),
    ...(osFilter?.length && {
      rhel_version: osFilter.join(','),
    }),
    ...(filters?.hostGroupFilter?.length && {
      groups: filters.hostGroupFilter.join(','),
    }),
    ...(filters.tagFilters?.length && buildTagFilter(filters.tagFilters)),
    ...(workloads ? workloadQueryBuilder(workloads, SID) : {}),
    ...(selectedTags?.length > 0 ? { tags: selectedTags.join(',') } : {}),
  };
  return options;
};

export const sortTopics = (data, index, direction) => {
  let sortingName = '';
  index === 0
    ? (sortingName = 'name')
    : index === 2
      ? (sortingName = 'featured')
      : (sortingName = 'impacted_systems_count');
  return orderBy(data, [(result) => result[sortingName]], direction);
};

export const createSortParam = (sortField, sortDirection = 'ASC') => {
  return `${sortDirection.toUpperCase() === 'ASC' ? '' : '-'}${
    (sortField === 'updated' && 'last_seen') ||
    (sortField === 'operating_system' && 'rhel_version') ||
    (sortField === 'groups' && 'group_name') ||
    sortField
  }`;
};

export const populateExportError = (error) => {
  return {
    ...exportNotifications.error,
    title: `${exportNotifications.error.title}: ${error.message}`,
  };
};

export const getCsrfTokenHeader = () => {
  // X-CSRF-Token header is required for LoP mutations
  const csrfToken = document?.querySelector('meta[name="csrf-token"]')?.content;
  return csrfToken ? { 'X-CSRF-Token': csrfToken } : {};
};
