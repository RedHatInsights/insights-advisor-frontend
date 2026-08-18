import useTableToolsQuery from '../../Utilities/hooks/useTableToolsQuery';

export const convertToArray = (params) => [params];

const useRecsQuery = (options) =>
  useTableToolsQuery('ruleList', { ...options, convertToArray });

export default useRecsQuery;
