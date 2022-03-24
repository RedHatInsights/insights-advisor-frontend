import { generateFilter } from '@redhat-cloud-services/frontend-components-utilities/helpers';

// Builds returns url params from table filters, pushes to url if history object is passed
export const urlBuilder = (filters = {}) => {
  const url = new URL(window.location);
  const queryString = `${Object.keys(filters)
    .map(
      (key) =>
        `${key}=${
          Array.isArray(filters[key]) ? filters[key].join() : filters[key]
        }`
    )
    .join('&')}`;
  const params = new URLSearchParams(queryString);

  //Removes invalid 'undefined' url param value
  params.get('reports_shown') === 'undefined' && params.delete('reports_shown');
  filters?.tags?.length
    ? params.set('tags', filters.tags)
    : params.delete('tags');
  window.history.replaceState(
    null,
    null,
    `${url.origin}${url.pathname}?${params.toString()}${window.location.hash}`
  );
  return `?${queryString}`;
};

export const buildTagFilter = (tagFilters) => {
  const tagsApiFilter = tagFilters
    ? {
        tags: tagFilters.flatMap((tagFilter) =>
          tagFilter.values.map(
            (tag) =>
              `${encodeURIComponent(tagFilter.key)}/${encodeURIComponent(
                tag.tagKey
              )}=${encodeURIComponent(tag.value)}`
          )
        ),
      }
    : {};

  return {
    ...tagsApiFilter,
  };
};

// transforms array of strings -> comma seperated strings, required by advisor api
export const filterFetchBuilder = (filters) =>
  Object.assign(
    {},
    ...Object.entries(filters).map(([filterName, filterValue]) =>
      Array.isArray(filterValue)
        ? (filterValue[0] === 'true' || filterValue[0] === 'false') &&
          filterValue.length > 1
          ? null
          : { [filterName]: filterValue.join() }
        : { [filterName]: filterValue }
    )
  );

// parses url params for use in table/filter chips
export const paramParser = () => {
  const searchParams = new URLSearchParams(window.location.search);
  return Array.from(searchParams).reduce(
    (acc, [key, value]) => ({
      ...acc,
      [key]:
        value === 'true' || value === 'false'
          ? JSON.parse(value)
          : value.split(','),
    }),
    {}
  );
};

// create url from options
export const encodeOptionsToURL = (options) => {
  return Object.entries(options).reduce((acc, [key, value], index) => {
    return (acc += index === 0 ? `${key}=${value}` : `&${key}=${value}`);
  }, '');
};

// capitalizes text string
export const capitalize = (string) =>
  string[0].toUpperCase() + string.substring(1);

export const pruneFilters = (localFilters, filterCategories) => {
  const prunedFilters = Object.entries(localFilters);
  return prunedFilters.length > 0
    ? prunedFilters.reduce((arr, item) => {
        if (filterCategories[item[0]]) {
          const category = filterCategories[item[0]];
          const chips = Array.isArray(item[1])
            ? item[1].map((value) => {
                const selectedCategoryValue = category.values.find(
                  (values) => values.value === String(value)
                );
                return selectedCategoryValue
                  ? {
                      name:
                        selectedCategoryValue.text ||
                        selectedCategoryValue.label,
                      value,
                    }
                  : { name: value, value };
              })
            : [
                {
                  name: category.values.find(
                    (values) => values.value === String(item[1])
                  ).label,
                  value: item[1],
                },
              ];
          return [
            ...arr,
            {
              category: capitalize(category.title),
              chips,
              urlParam: category.urlParam,
            },
          ];
        } else if (item[0] === 'text') {
          return [
            ...arr,
            {
              category: 'Name',
              chips: [{ name: item[1], value: item[1] }],
              urlParam: item[0],
            },
          ];
        } else {
          return arr;
        }
      }, [])
    : [];
};

// builds workload query filter
export const workloadQueryBuilder = (workloads, SID) =>
  generateFilter(
    {
      system_profile: {
        ...(workloads?.SAP?.isSelected && { sap_system: true }),
        ...(SID?.length > 0 && { sap_sids: SID }),
      },
    },
    undefined,
    { arrayEnhancer: 'contains' }
  );

// merges two array objects by different key names
export const mergeArraysByDiffKeys = (advSystems, invSystems) =>
  advSystems.map((advSys) => ({
    ...invSystems.find(
      (invSys) => invSys['id'] === advSys['system_uuid'] && invSys
    ),
    ...advSys,
  }));
