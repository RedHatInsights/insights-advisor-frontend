import { useCallback } from 'react';
import { useIntl } from 'react-intl';
import { useDispatch } from 'react-redux';
import messages from '../../Messages';
import { hideReports } from './helpers';
import { BASE_URL } from '../../AppConstants';

export const useActionsResolver = (
  rows,
  setSelectedRule,
  setDisableRuleOpen,
  refetch,
  addNotification,
  baseUrl = BASE_URL,
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
              onClick: () =>
                hideReports(
                  rowIndex,
                  rows,
                  setSelectedRule,
                  setDisableRuleOpen,
                  refetch,
                  dispatch,
                  intl,
                  addNotification,
                  baseUrl,
                ),
            },
          ]
        : [
            {
              title: intl.formatMessage(messages.enableRule),
              onClick: () =>
                hideReports(
                  rowIndex,
                  rows,
                  setSelectedRule,
                  setDisableRuleOpen,
                  refetch,
                  dispatch,
                  intl,
                  addNotification,
                  baseUrl,
                ),
            },
          ];
    },
    [
      rows,
      setSelectedRule,
      setDisableRuleOpen,
      refetch,
      dispatch,
      intl,
      addNotification,
      baseUrl,
    ],
  );

  return actionResolver;
};
