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
    ...(advisorFilters.rhel_version && {
      rhel_version: advisorFilters.rhel_version?.join(','),
    }),
    ...(filters?.hostGroupFilter?.length && {
      group_name: filters.hostGroupFilter,
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
