import { buildTagFilter, workloadQueryBuilder } from './Common/Tables';

export const createOptions = (
  advisorFilters,
  page,
  per_page,
  sort,
  pathway,
  filters,
  selectedTags,
  workloads,
  SID
) => {
  let options = {
    ...advisorFilters,
    limit: per_page,
    offset: page * per_page - per_page,
    sort: sort,
    ...(filters?.hostnameOrId &&
      !pathway && {
        name: filters?.hostnameOrId,
      }),
    ...(filters.hostnameOrId &&
      pathway && {
        display_name: filters?.hostnameOrId,
      }),
    ...(advisorFilters.rhel_version && {
      rhel_version: advisorFilters.rhel_version?.join(','),
    }),
    ...(filters.tagFilters?.length && buildTagFilter(filters.tagFilters)),
    ...(workloads ? workloadQueryBuilder(workloads, SID) : {}),
    ...(selectedTags?.length > 0 ? { tags: selectedTags.join(',') } : {}),
  };
  return options;
};
