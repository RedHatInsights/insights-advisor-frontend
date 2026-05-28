import { useCallback } from 'react';
import { useStateCallbacks } from 'bastilian-tabletools';
import { useIntl } from 'react-intl';
import messages from '../../Messages';
import useEnableRule from './useEnableRule';

/**
 * Hook for RulesTable action resolver
 *
 * Provides actionResolver function for bastilian-tabletools
 * following the standard pattern from malware-detection-frontend
 *
 * Actions:
 * - Enable rule: DELETE /ack/{rule_id} - handled directly via useEnableRule
 * - Disable rule: Opens DisableRule modal via callback
 *
 * @param {Object} options
 * @param {Function} options.onDisableClick - Callback to open disable modal
 * @returns {Object} { actionResolver } - Function for table options
 */
const useRulesTableActions = ({ onDisableClick }) => {
  const intl = useIntl();
  const {
    current: { reload },
  } = useStateCallbacks();
  const { enableRule } = useEnableRule();

  const handleEnableClick = useCallback(
    async ({ rule_id }) => {
      const result = await enableRule(rule_id);
      if (result.success) {
        reload(); // Use tabletools reload mechanism
      }
    },
    [enableRule, reload],
  );

  const actionResolver = useCallback(
    (rowData) => {
      const { item } = rowData;

      if (!item) {
        return [];
      }

      const { rule_status, rule_id } = item;

      // Only show actions for enabled/disabled rules
      if (rule_status !== 'enabled' && rule_status !== 'disabled') {
        return [];
      }

      return [
        rule_status === 'enabled'
          ? {
              title: intl.formatMessage(messages.disableRule),
              onClick: () => onDisableClick({ rule_id, rule_status }),
            }
          : {
              title: intl.formatMessage(messages.enableRule),
              onClick: () => handleEnableClick({ rule_id, rule_status }),
            },
      ];
    },
    [intl, onDisableClick, handleEnableClick],
  );

  return { actionResolver };
};

export default useRulesTableActions;
