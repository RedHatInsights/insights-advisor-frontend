import { workloadQueryBuilder, buildTagFilter } from '../Common/Tables';
import { Get } from '../../Utilities/Api';
import { mergeArraysByDiffKeys } from '../Common/Tables';
import { RULES_FETCH_URL, SYSTEMS_FETCH_URL } from '../../AppConstants';

/*This functions purpose is to grab the currently set filters, and return all associated systems for it.*/
export const paginatedRequestHelper = async ({
  per_page,
  page,
  advisorFilters,
  filters,
  workloads,
  SID,
  pathway,
  rule,
  selectedTags,
}) => {
  let options = {
    ...advisorFilters,
    limit: per_page,
    offset: page * per_page - per_page,
    sort: advisorFilters.sort,
    ...(filters?.hostnameOrId &&
      !pathway && {
        name: filters?.hostnameOrId,
      }),
    ...(filters.hostnameOrId &&
      pathway && {
        display_name: filters?.hostnameOrId,
      }),
    ...(Array.isArray(advisorFilters.rhel_version) && {
      rhel_version: advisorFilters.rhel_version?.join(','),
    }),
    ...(filters.tagFilters?.length && buildTagFilter(filters.tagFilters)),
    ...(workloads ? workloadQueryBuilder(workloads, SID) : {}),
    ...(selectedTags?.length > 0 ? { tags: selectedTags.join(',') } : {}),
  };

  return pathway
    ? (
        await Get(
          `${SYSTEMS_FETCH_URL}`,
          {},
          { ...options, pathway: pathway.slug }
        )
      )?.data
    : (
        await Get(
          `${RULES_FETCH_URL}${encodeURI(rule.rule_id)}/systems_detail/`,
          {},
          options
        )
      )?.data;
};

export const getEntities =
  (
    handleRefresh,
    pathway,
    setCurPageIds,
    setTotal,
    selectedIds,
    setFullFilters,
    fullFilters,
    rule,
    setFilters
  ) =>
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
    } = config;
    const sort = `${orderDirection === 'ASC' ? '' : '-'}${
      orderBy === 'updated' ? 'last_seen' : orderBy
    }`;

    let options = {
      ...advisorFilters,
      limit: per_page,
      offset: page * per_page - per_page,
      sort,
      ...(config?.filters?.hostnameOrId &&
        !pathway && {
          name: config?.filters?.hostnameOrId,
        }),
      ...(config.filters.hostnameOrId &&
        pathway && {
          display_name: config?.filters?.hostnameOrId,
        }),
      ...(Array.isArray(advisorFilters.rhel_version) && {
        rhel_version: advisorFilters.rhel_version?.join(','),
      }),
      ...(filters.tagFilters?.length && buildTagFilter(filters.tagFilters)),
      ...(config.selectedTags?.length > 0
        ? { tags: config.selectedTags.join(',') }
        : {}),
      ...(workloads ? workloadQueryBuilder(workloads, SID) : {}),
    };

    handleRefresh(options);
    const allDetails = { ...config, pathway, handleRefresh, rule };
    setFullFilters(allDetails);
    setFilters({ ...filters, sort: sort });
    const fetchedSystems = await paginatedRequestHelper(allDetails);
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
    setCurPageIds(fetchedSystems.data.map((system) => system.system_uuid));
    setTotal(fetchedSystems.meta.count);
    return Promise.resolve({
      results: mergeArraysByDiffKeys(fetchedSystems.data, results.results).map(
        (item) => {
          return {
            ...item,
            selected: selectedIds?.includes(item.id),
          };
        }
      ),
      total: fetchedSystems.meta.count,
    });
  };

/*Takes in the current filters, and keeps sending get request until there are no pages left*/
const fetchBatched = (fetchFunction, total, filter, batchSize = 100, rule) => {
  const pages = Math.ceil(total / batchSize) || 1;
  return Promise.all(
    [...new Array(pages)].map((_, pageIdx) =>
      fetchFunction({ ...filter, page: pageIdx + 1, per_page: batchSize, rule })
    )
  );
};
/*Grabs all systemIds and maniupaltes the data into one large array of systems*/
export const allCurrentSystemIds =
  (fullFilters, total, rule, setIsLoading) => async () => {
    setIsLoading(true);
    const results = await (
      await fetchBatched(paginatedRequestHelper, total, fullFilters, 100, rule)
    ).map((item) => item.data);

    const merged = [].concat.apply([], results).map((item) => item.system_uuid);
    setIsLoading(false);
    return merged;
  };
