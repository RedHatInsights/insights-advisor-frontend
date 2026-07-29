import useTableToolsQuery from '../../Utilities/hooks/useTableToolsQuery';

/**
 * Convert params to the format expected by pathwayList
 * insights-client pathwayList expects an object as the first parameter
 */
export const convertToArray = (params) => [params];

/**
 * Hook to fetch pathways data with automatic table state integration
 * @param {object} options - Query options
 * @param {boolean} options.useTableState - If true, automatically syncs with table state (pagination, sort, filters)
 * @param {boolean} options.skip - If true, skip the query
 * @param {object} options.params - Additional params to merge (tags, workloads, etc.)
 * @returns {object} - Query result with data, loading, error, etc.
 */
const usePathwaysQuery = (options) =>
  useTableToolsQuery('pathwayList', { ...options, convertToArray });

export default usePathwaysQuery;
