import { useCallback } from 'react';
import { useIntl } from 'react-intl';
import { useDispatch } from 'react-redux';
import messages from '../../Messages';
import { hideReports } from './helpers';

export const useActionsResolver = (
  rows,
  setSelectedRule,
  setDisableRuleOpen,
  refetch,
  addNotification,
) => {
  const intl = useIntl();
  const dispatch = useDispatch();

  const actionResolver = useCallback(
    (rowData, { rowIndex }) => {
      const rule = rows[rowIndex].rule ? rows[rowIndex].rule : null;
      if (rowIndex % 2 !== 0 || !rule) {
        return null;
      }

      return rule && rule.rule_status === 'enabled'
        ? [
            {
              title: intl.formatMessage(messages.disableRule),
              onClick: (_event, rowId) =>
                hideReports(
                  rowId,
                  rows,
                  setSelectedRule,
                  setDisableRuleOpen,
                  refetch,
                  dispatch,
                  intl,
                  addNotification,
                ),
            },
          ]
        : [
            {
              title: intl.formatMessage(messages.enableRule),
              onClick: (_event, rowId) =>
                hideReports(
                  rowId,
                  rows,
                  setSelectedRule,
                  setDisableRuleOpen,
                  refetch,
                  dispatch,
                  intl,
                  addNotification,
                ),
            },
          ];
    },
    [rows, setSelectedRule, setDisableRuleOpen, refetch, dispatch, intl],
  );

  return actionResolver;
};
