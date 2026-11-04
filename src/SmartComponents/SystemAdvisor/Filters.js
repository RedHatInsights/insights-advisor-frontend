import { FILTER_CATEGORIES, RULE_CATEGORIES } from '../../AppConstants';

const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

/**
 * Escapes special regex characters in a search term for jsonquery regex queries.
 *
 * @param {string|string[]} value - The input search string or array containing the search string
 * @returns {string} Regex-escaped string safe for jsonquery expressions
 */
const escapeRegExpForJsonQuery = (value) => {
  const text = Array.isArray(value) ? value[0] : value;
  return String(text).replace(/[.*+?^${}()|[\]\\]/g, '\\\\$&');
};

/**
 * Text search filter configuration by rule description.
 */
export const textFilter = {
  type: 'text',
  label: 'Description',
  filterAttribute: 'rule.description',
  id: 'text',
  urlParam: 'text',
  placeholder: 'Filter by description',
  filterSerialiser: (_filterConfigItem, value) => {
    const textValue = Array.isArray(value) ? value[0] : value;
    return textValue
      ? `regex(.rule.description, "${escapeRegExpForJsonQuery(textValue)}", "i")`
      : undefined;
  },
};

/**
 * Total risk multi-select filter configuration.
 */
export const totalRiskFilter = {
  type: 'checkbox',
  label: capitalize(FILTER_CATEGORIES.total_risk.title),
  filterAttribute: 'rule.total_risk',
  id: FILTER_CATEGORIES.total_risk.urlParam,
  urlParam: FILTER_CATEGORIES.total_risk.urlParam,
  items: FILTER_CATEGORIES.total_risk.values,
  filterSerialiser: (_filterConfigItem, values) => {
    const riskValues = (Array.isArray(values) ? values : [])
      .map(Number)
      .filter((n) => !Number.isNaN(n));
    return riskValues.length > 0
      ? `.rule.total_risk in [${riskValues.join(',')}]`
      : undefined;
  },
};

/**
 * Category multi-select filter configuration with name/ID mapping.
 */
export const categoryFilter = {
  type: 'checkbox',
  label: capitalize(FILTER_CATEGORIES.category.title),
  filterAttribute: 'rule.category.id',
  id: FILTER_CATEGORIES.category.urlParam,
  urlParam: FILTER_CATEGORIES.category.urlParam,
  items: FILTER_CATEGORIES.category.values,
  filterSerialiser: (_filterConfigItem, values) => {
    const rawValues = Array.isArray(values) ? values : [];
    const categoryIds = rawValues
      .map((val) => {
        const num = Number(val);
        if (!Number.isNaN(num)) {
          return num;
        }
        return RULE_CATEGORIES[String(val).toLowerCase()];
      })
      .filter((n) => n !== undefined && !Number.isNaN(n));

    return categoryIds.length > 0
      ? `.rule.category.id in [${categoryIds.join(',')}]`
      : undefined;
  },
};

/**
 * Playbook availability filter configuration.
 */
export const playbookFilter = {
  type: 'checkbox',
  label: capitalize(FILTER_CATEGORIES.has_playbook.title),
  filterAttribute: 'resolution.has_playbook',
  id: FILTER_CATEGORIES.has_playbook.urlParam,
  urlParam: FILTER_CATEGORIES.has_playbook.urlParam,
  items: FILTER_CATEGORIES.has_playbook.values,
  filterSerialiser: (_filterConfigItem, values) => {
    const valArray = Array.isArray(values) ? values : [];
    if (valArray.length === 1) {
      const boolVal = String(valArray[0]).toLowerCase() === 'true';
      return `.resolution.has_playbook == ${boolVal}`;
    }
    return undefined;
  },
};

export default [textFilter, totalRiskFilter, categoryFilter, playbookFilter];
