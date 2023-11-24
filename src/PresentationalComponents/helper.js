import { buildTagFilter, workloadQueryBuilder } from './Common/Tables';
import { orderBy } from 'lodash';

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
  systemsPage
) => {
  let options = {
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
    ...(filters.osFilter?.length > 0 && {
      rhel_version: filters.osFilter.map(({ value }) => value).join(','),
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
