import React from 'react';
import PropTypes from 'prop-types';
import { useFeatureFlag } from '../../Utilities/Hooks';
import RulesTableOriginal from './RulesTable.original';
import RulesTableNew from './RulesTable.new';

/**
 * RulesTable - Feature Flag Toggle Wrapper
 *
 * This component toggles between the original RulesTable implementation
 * and the new tabletools-based implementation based on the feature flag.
 *
 * Feature Flag: advisor-tabletools-migration
 * - false (default): Original implementation
 * - true: New tabletools implementation
 */
const RulesTable = (props) => {
  const tabletoolsEnabled = useFeatureFlag('advisor-tabletools-migration');

  if (tabletoolsEnabled) {
    return <RulesTableNew {...props} />;
  }

  return <RulesTableOriginal {...props} />;
};

RulesTable.propTypes = {
  isTabActive: PropTypes.bool,
  pathway: PropTypes.string,
  onRuleChange: PropTypes.func,
};

export default RulesTable;
