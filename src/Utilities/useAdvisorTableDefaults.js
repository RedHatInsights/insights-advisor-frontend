import { useMemo } from 'react';
import {
  paginationSerialiser,
  sortSerialiser,
  filtersSerialiser,
} from './tableSerializers';

const useAdvisorTableDefaults = (sortBy) => {
  const defaults = useMemo(
    () => ({
      serialisers: {
        pagination: paginationSerialiser,
        sort: sortSerialiser,
        filters: filtersSerialiser,
      },
      variant: 'compact',
      isStickyHeader: true,
      perPage: 20,
      ...(sortBy ? { sortBy } : {}),
    }),
    [sortBy],
  );

  return defaults;
};

export default useAdvisorTableDefaults;
