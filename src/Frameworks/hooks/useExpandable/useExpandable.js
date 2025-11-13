import { useState, useCallback, useEffect } from 'react';

/**
 * Hook to manage expandable rows in a PatternFly 6 Table
 * Uses item IDs instead of indices for more robust state management
 *
 * @param {object} options - Configuration options
 * @param {number} options.page - Current page number (resets expanded rows on change)
 * @returns {object} - Expandable row helpers and state
 */
const useExpandable = ({ page } = {}) => {
  const [expandedIds, setExpandedIds] = useState([]);
  const [isAllExpanded, setIsAllExpanded] = useState(false);

  // Reset expanded rows when page changes
  useEffect(() => {
    setExpandedIds([]);
    setIsAllExpanded(false);
  }, [page]);

  /**
   * Toggle a single row's expanded state
   * @param {string} itemId - The unique identifier for the item
   */
  const toggleExpanded = useCallback((itemId) => {
    setExpandedIds((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  }, []);

  /**
   * Check if an item is expanded
   * @param {string} itemId - The unique identifier for the item
   * @returns {boolean} - Whether the item is expanded
   */
  const isExpanded = useCallback(
    (itemId) => expandedIds.includes(itemId),
    [expandedIds]
  );

  /**
   * Expand or collapse all rows on the current page
   * @param {boolean} shouldExpand - Whether to expand (true) or collapse (false)
   * @param {Array} items - The items on the current page
   * @param {string} idKey - The key to use for item IDs (default: 'rule_id')
   */
  const expandAll = useCallback((shouldExpand, items, idKey = 'rule_id') => {
    setIsAllExpanded(shouldExpand);
    if (shouldExpand) {
      const itemIds = items.map((item) => item[idKey]);
      setExpandedIds(itemIds);
    } else {
      setExpandedIds([]);
    }
  }, []);

  /**
   * Get the row index for a given item ID from a list of items
   * Used to determine which row index to pass to PatternFly Table
   * @param {string} itemId - The unique identifier for the item
   * @param {Array} items - The items on the current page
   * @param {string} idKey - The key to use for item IDs (default: 'rule_id')
   * @returns {number} - The row index, or -1 if not found
   */
  const getRowIndex = useCallback((itemId, items, idKey = 'rule_id') => {
    return items.findIndex((item) => item[idKey] === itemId);
  }, []);

  return {
    expandedIds,
    isExpanded,
    toggleExpanded,
    expandAll,
    isAllExpanded,
    getRowIndex,
  };
};

export default useExpandable;
