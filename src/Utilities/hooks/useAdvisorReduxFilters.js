import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { workloadQueryBuilder } from '../../PresentationalComponents/Common/Tables';

/**
 * Centralized hook for merging Redux global filters (tags, workloads)
 * with additional table-specific params (pathway, topic, etc.)
 *
 * This hook eliminates duplicated Redux integration code that was
 * repeated in PathwaysTable and RulesTable implementations.
 *
 * **Problem it solves:**
 * Before this hook, each table had ~15 lines of duplicated code:
 * - Redux selectors for selectedTags and workloads
 * - Prop drilling through wrapper components
 * - Manual merging of global + table-specific params
 *
 * **After:**
 * Just one line: `const { additionalParams } = useAdvisorReduxFilters()`
 *
 * @param {Object} additionalFilters - Table-specific params (pathway, topic, etc.)
 * @returns {Object} - {additionalParams, selectedTags, workloads}
 *
 * @example
 * // PathwaysTable - only needs global filters
 * const { additionalParams } = useAdvisorReduxFilters();
 * // Returns: { tags: 'RHEL8,Production', sap: true }
 *
 * @example
 * // RulesTable - needs global + table-specific filters
 * const { additionalParams } = useAdvisorReduxFilters({ pathway: 'security', topic: 'compliance' });
 * // Returns: { tags: 'RHEL8,Production', sap: true, pathway: 'security', topic: 'compliance' }
 */
const useAdvisorReduxFilters = (additionalFilters = {}) => {
  // Get global filters from Redux store
  const selectedTags = useSelector(({ filters }) => filters.selectedTags);
  const workloads = useSelector(({ filters }) => filters.workloads);

  // Merge global filters with table-specific params
  const additionalParams = useMemo(() => {
    let params = { ...additionalFilters };

    // Add tags filter if any tags are selected
    // Converts array ['RHEL8', 'Production'] to string 'RHEL8,Production'
    if (selectedTags?.length) {
      params.tags = selectedTags.join(',');
    }

    // Add workload filters using Advisor's workload query builder
    // Converts workloads object to API params (e.g., { sap: true, satellite: true })
    if (workloads) {
      params = { ...params, ...workloadQueryBuilder(workloads) };
    }

    return params;
  }, [selectedTags, workloads, JSON.stringify(additionalFilters)]);

  return {
    additionalParams,
    selectedTags,
    workloads,
  };
};

export default useAdvisorReduxFilters;
