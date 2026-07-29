import useTableToolsQuery from '../../Utilities/hooks/useTableToolsQuery';

/**
 * Convert params to the format expected by topicList
 * insights-client topicList expects an object as the first parameter
 */
export const convertToArray = (params) => [params];

/**
 * Hook to fetch topics data with automatic table state integration
 * @param {object} options - Query options
 * @param {boolean} options.useTableState - If true, automatically syncs with table state (pagination, sort, filters)
 * @param {boolean} options.skip - If true, skip the query
 * @param {object} options.params - Additional params to merge (tags, workloads, show_disabled, etc.)
 * @returns {object} - Query result with data, loading, error, etc.
 */
const useTopicsQuery = (options) =>
  useTableToolsQuery('topicList', { ...options, convertToArray });

export default useTopicsQuery;
