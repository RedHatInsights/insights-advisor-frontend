import useTableToolsQuery from '../../Utilities/hooks/useTableToolsQuery';

/**
 * Convert params to the format expected by ruleList
 * insights-client ruleList expects an object as the first parameter
 */
export const convertToArray = (params) => [params];

/**
 * Hook to fetch recommendations (rules) data with automatic table state integration
 *
 * **Usage Examples:**
 *
 * @example
 * // Basic usage with table state
 * const { data, loading } = useRecsQuery({
 *   useTableState: true,
 *   params: { tags: 'RHEL8,Production' }
 * });
 *
 * @example
 * // With additional filters (pathway, topic)
 * const { data, loading } = useRecsQuery({
 *   useTableState: true,
 *   params: {
 *     tags: 'RHEL8',
 *     pathway: 'security-compliance',
 *     topic: 'vulnerability'
 *   }
 * });
 *
 * @param {Object} options - Query options
 * @param {boolean} options.useTableState - If true, automatically syncs with table state (pagination, sort, filters)
 * @param {boolean} options.skip - If true, skip the query
 * @param {Object} options.params - Additional params to merge (tags, workloads, pathway, topic, etc.)
 * @returns {Object} - Query result { data, loading, error, refetch, ... }
 *
 * **Data Format:**
 * ```javascript
 * {
 *   data: {
 *     data: [...],     // Array of recommendation objects
 *     meta: {
 *       total: 123,   // Total count
 *       count: 123    // Same as total
 *     }
 *   },
 *   loading: false,
 *   error: null,
 *   refetch: () => {}
 * }
 * ```
 */
const useRecsQuery = (options) =>
  useTableToolsQuery('ruleList', { ...options, convertToArray });

export default useRecsQuery;
