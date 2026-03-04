import { useCallback } from 'react';
import { useIntl } from 'react-intl';
import { useDispatch } from 'react-redux';
import messages from '../../Messages';
import { hideReports } from './helpers';
import { BASE_URL } from '../../AppConstants';
import { useAxiosWithPlatformInterceptors } from '@redhat-cloud-services/frontend-components-utilities/interceptors';

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
  const axios = useAxiosWithPlatformInterceptors();

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
                  axios,
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
                  axios,
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
      axios,
    ],
  );

  return actionResolver;
};
