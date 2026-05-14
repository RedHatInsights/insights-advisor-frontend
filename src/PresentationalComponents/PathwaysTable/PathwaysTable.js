import React from 'react';
import PropTypes from 'prop-types';
import { useFeatureFlag } from '../../Utilities/Hooks';
import PathwaysTableOriginal from './PathwaysTable.original';
import PathwaysTableNew from './PathwaysTable.new';

/**
 * Pathways table with feature flag toggle between original and tabletools implementations.
 * Uses 'advisor-tabletools-migration' feature flag to switch between:
 * - PathwaysTableOriginal: Legacy PatternFly table implementation
 * - PathwaysTableNew: bastilian-tabletools implementation with server-side pagination
 */
const PathwaysTable = ({ isTabActive }) => {
  const useNewTable = useFeatureFlag('advisor-tabletools-migration');

  if (useNewTable) {
    return <PathwaysTableNew isTabActive={isTabActive} />;
  }

  return <PathwaysTableOriginal isTabActive={isTabActive} />;
};

PathwaysTable.propTypes = {
  isTabActive: PropTypes.bool,
};

export default PathwaysTable;
