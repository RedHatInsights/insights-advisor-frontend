import { useMemo } from 'react';
import {
  paginationSerialiser,
  sortSerialiser,
  filtersSerialiser,
} from './tableSerializers';

const useAdvisorTableDefaults = ({ sortBy, columns, filters } = {}) => {
  const defaults = useMemo(
    () => ({
      serialisers: {
        pagination: paginationSerialiser,
        sort: (sortState) => sortSerialiser(sortState, columns),
        filters: (filterState) => filtersSerialiser(filterState, filters),
      },
      variant: 'compact',
      isStickyHeader: true,
      perPage: 20,
      ...(sortBy ? { sortBy } : {}),
    }),
    [sortBy, columns, filters],
  );

  return defaults;
};

export default useAdvisorTableDefaults;
