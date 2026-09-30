import { generateFilter } from '@redhat-cloud-services/frontend-components-utilities/helpers';
import { SYSTEM_FILTER_CATEGORIES, SYSTEM_TYPES } from '../../AppConstants';
import isEqual from 'lodash/isEqual';
import cloneDeep from 'lodash/cloneDeep';

// Builds returns url params from table filters, pushes to url if history object is passed
export const urlBuilder = (filters = {}, selectedTags) => {
  const url = new URL(window.location);
  const queryString = `${Object.keys(filters)
    .map(
      (key) =>
        `${key}=${
          Array.isArray(filters[key]) ? filters[key].join() : filters[key]
        }`,
    )
    .join('&')}`;

  const params = new URLSearchParams(queryString);

  //Removes invalid 'undefined' url param value and duplicate pathway param
  params.get('reports_shown') === 'undefined' && params.delete('reports_shown');
  params.get('pathway') && params.delete('pathway');

  const tagsToSet = selectedTags?.length ? selectedTags : filters?.tags;
  tagsToSet?.length
    ? params.set(
        'tags',
        Array.isArray(tagsToSet) ? tagsToSet.join() : tagsToSet,
      )
    : params.delete('tags');
  window.history.replaceState(
    null,
    null,
    `${url.origin}${url.pathname}?${params.toString()}${window.location.hash}`,
  );
  return `?${queryString}`;
};

export const buildTagFilter = (tagFilters) => {
  const tagsApiFilter = tagFilters
    ? {
        tags: tagFilters.flatMap((tagFilter) =>
          tagFilter.values.map(
            (tag) =>
              `${tagFilter.key}/${tag.tagKey}=${tag.value != null && tag.value !== '' ? `${tag.value}` : ''}`,
          ),
        ),
      }
    : {};

  return {
    ...tagsApiFilter,
  };
};

export const mapUpdateMethodFilterToAPISpec = (filters) => {
  const clonedFilters = cloneDeep(filters);

  if (
    clonedFilters?.update_method === '' ||
    isEqual(clonedFilters?.update_method?.split(',').sort(), [
      'dnfyum',
      'none',
      'ostree',
    ])
  ) {
    //when user deselects all update_method filters remove the both update_method and impacting filters
    delete clonedFilters.update_method;
    delete clonedFilters.impacting;
  } else if (clonedFilters?.update_method?.includes('none')) {
    //remove update_method filter from API options and set impacting to false if only none options is chosen
    if (clonedFilters.update_method === 'none') {
      delete clonedFilters.update_method;
      clonedFilters.impacting = 'false';

      //in any other cases, remove 'none' option from the API options as it does have any handler
      //concatenate or set false to impacting API option
    } else {
      const filteredValues = clonedFilters.update_method.replace(
        /,none|none,|none/g,
        '',
      );

      clonedFilters.update_method = filteredValues;
      delete clonedFilters.impacting;
    }
  }

  if (clonedFilters?.impacting === '') {
    delete clonedFilters.impacting;
  }

  return clonedFilters;
};

// transforms array of strings -> comma seperated strings, required by advisor api
export const filterFetchBuilder = (filters) => {
  const joinedFilters = Object.assign(
    {},
    ...Object.entries(filters).map(([filterName, filterValue]) =>
      Array.isArray(filterValue)
        ? (filterValue[0] === 'true' || filterValue[0] === 'false') &&
          filterValue.length > 1
          ? null
          : { [filterName]: filterValue.join() }
        : { [filterName]: filterValue },
    ),
  );

  return mapUpdateMethodFilterToAPISpec(joinedFilters);
};

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
    {},
  );
};

// capitalizes text string
export const capitalize = (string) =>
  string[0].toUpperCase() + string.substring(1);

const SEARCH_KEYS = new Set(['text', 'name', 'display_name']);

/**
 * Resolves the display label for an active filter value.
 *
 * @param {string} key - Filter URL parameter identifier (e.g. 'rhel_version', 'hits').
 * @param {string|number} value - Selected filter value.
 * @param {object} [category] - Category definition with values lookup array.
 * @param {Array<{value: string, label?: string, text?: string}>} [category.values] - Filter options.
 * @returns {string} Formatted label or string fallback for the chip.
 */
export const resolveChipLabel = (key, value, category) => {
  if (key === SYSTEM_FILTER_CATEGORIES.rhel_version.urlParam) {
    return `RHEL ${value}`;
  }
  const match = category?.values?.find(
    (v) => String(v.value) === String(value),
  );
  return match?.text || match?.label || String(value);
};

/**
 * Transforms a category filter entry into a PatternFly toolbar chip descriptor.
 *
 * @param {string} key - Filter key from local filters state.
 * @param {string|number|Array<string|number>} value - Single value or array of selected values.
 * @param {object} category - Category definition from SYSTEM_FILTER_CATEGORIES.
 * @param {string} category.title - Category title.
 * @param {string} category.urlParam - Query parameter key for API requests.
 * @param {Array<object>} [category.values] - Filter item options.
 * @returns {{category: string, urlParam: string, chips: Array<{name: string, value: string|number}>}} Structured category chip object.
 */
export const toCategoryChip = (key, value, category) => {
  const values = Array.isArray(value) ? value : [value];
  return {
    category: capitalize(category.title),
    chips: values.map((v) => ({
      name: resolveChipLabel(key, v, category),
      value: v,
    })),
    urlParam: category.urlParam,
  };
};

/**
 * Transforms a search text filter entry into a PatternFly toolbar chip descriptor.
 *
 * @param {string} key - Search URL parameter identifier ('text', 'name', or 'display_name').
 * @param {string} value - Non-empty search query string.
 * @returns {{category: 'Name', urlParam: string, chips: Array<{name: string, value: string}>}} Structured search chip object.
 */
export const toSearchChip = (key, value) => ({
  category: 'Name',
  chips: [{ name: value, value }],
  urlParam: key,
});

/**
 * Prunes and transforms active table filters into PatternFly toolbar filter chips.
 *
 * Consumed by table components (e.g. `Inventory.js`, `PathwaysTable.js`, `SystemsTable.js`)
 * to populate `activeFiltersConfig.filters` for PatternFly's `PrimaryToolbar`.
 *
 * @param {Record<string, any>} [localFilters={}] - Local component filter state.
 * @param {Record<string, object>} [filterCategories={}] - Dictionary mapping filter keys to category configs.
 * @returns {Array<{category: string, urlParam: string, chips: Array<{name: string, value: any}>}>} Array of chip descriptors.
 */
export const pruneFilters = (localFilters = {}, filterCategories = {}) => {
  const prunedFilters = Object.entries(localFilters);
  return prunedFilters.flatMap(([key, value]) => {
    if (filterCategories[key]) {
      return [toCategoryChip(key, value, filterCategories[key])];
    }
    const valString = Array.isArray(value) ? value.join(',') : value;
    if (
      SEARCH_KEYS.has(key) &&
      typeof valString === 'string' &&
      valString.trim().length > 0
    ) {
      return [toSearchChip(key, valString)];
    }
    return [];
  });
};

// builds workload query filter (Global tag filter)
export const workloadQueryBuilder = (workloads) =>
  generateFilter(
    {
      system_profile: {
        ...(workloads?.SAP?.isSelected && { sap_system: true }),
        ...(workloads?.['Ansible Automation Platform']?.isSelected && {
          ansible: {
            not_nil: true,
          },
        }),
        ...(workloads?.['Microsoft SQL']?.isSelected && {
          mssql: {
            not_nil: true,
          },
        }),
      },
    },
    undefined,
    { arrayEnhancer: 'contains' },
  );

export const workloadArrayQueryBuilder = (workloadFilter = []) => {
  if (!workloadFilter.length) return {};
  return { workload: workloadFilter };
};

// merges two array objects by different key names
export const mergeArraysByDiffKeys = (advSystems, invSystems) =>
  advSystems.map((advSys) => ({
    ...invSystems.find(
      (invSys) => invSys['id'] === advSys['system_uuid'] && invSys,
    ),
    ...advSys,
  }));

export const ruleResolutionRisk = (rule) => {
  const resolution = rule.resolution_set.find(
    (resolution) =>
      resolution.system_type === SYSTEM_TYPES.rhel || SYSTEM_TYPES.ocp,
  );
  return resolution ? resolution.resolution_risk.risk : undefined;
};
