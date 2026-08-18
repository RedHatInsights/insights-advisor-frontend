import { useState, useCallback } from 'react';

/**
 * Hook for managing disable rule modal state and interactions
 *
 * @param {Function} reload - Function to reload table data
 * @param {Function} onRuleChange - Optional callback when rule changes
 * @returns {Object} Modal state and handlers
 */
const useDisableRuleModal = (reload, onRuleChange) => {
  const [disableRuleModal, setDisableRuleModal] = useState({
    isOpen: false,
    rule: null,
  });

  /**
   * Opens the disable rule modal with the specified rule
   * @param {Object} params - Rule parameters
   * @param {string} params.rule_id - Rule ID
   * @param {string} params.rule_status - Rule status
   */
  const handleDisableClick = useCallback(({ rule_id, rule_status }) => {
    setDisableRuleModal({
      isOpen: true,
      rule: { rule_id, rule_status },
    });
  }, []);

  /**
   * Handles modal close by updating state
   * @param {boolean} isOpen - New open state
   */
  const handleModalToggle = useCallback((isOpen) => {
    setDisableRuleModal((prev) => ({ ...prev, isOpen }));
  }, []);

  /**
   * Handles post-disable actions: reload table, notify parent, close modal
   */
  const handleAfterDisable = useCallback(() => {
    reload?.();
    onRuleChange?.();
    setDisableRuleModal({ isOpen: false, rule: null });
  }, [reload, onRuleChange]);

  return {
    disableRuleModal,
    handleDisableClick,
    handleModalToggle,
    handleAfterDisable,
  };
};

export default useDisableRuleModal;
