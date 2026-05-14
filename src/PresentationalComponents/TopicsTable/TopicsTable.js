import React from 'react';
import PropTypes from 'prop-types';
import { useFeatureFlag } from '../../Utilities/Hooks';
import TopicsTableOriginal from './TopicsTable.original';
import TopicsTableNew from './TopicsTable.new';

/**
 * Topics table with feature flag toggle between original and tabletools implementations.
 * Uses 'advisor-tabletools-migration' feature flag to switch between:
 * - TopicsTableOriginal: Legacy PatternFly table implementation
 * - TopicsTableNew: bastilian-tabletools implementation
 */
const TopicsTable = ({ props }) => {
  const useNewTable = useFeatureFlag('advisor-tabletools-migration');

  if (useNewTable) {
    return <TopicsTableNew props={props} />;
  }

  return <TopicsTableOriginal props={props} />;
};

TopicsTable.propTypes = {
  props: PropTypes.shape({
    data: PropTypes.array.isRequired,
    isLoading: PropTypes.bool.isRequired,
    isFetching: PropTypes.bool.isRequired,
    isError: PropTypes.bool.isRequired,
  }).isRequired,
};

export default TopicsTable;
