import { useCallback } from 'react';
import { useIntl } from 'react-intl';
import { useAxiosWithPlatformInterceptors } from '@redhat-cloud-services/frontend-components-utilities/interceptors';
import { useAddNotification } from '@redhat-cloud-services/frontend-components-notifications/';
import { BASE_URL } from '../../AppConstants';
import { getCsrfTokenHeader } from '../../PresentationalComponents/helper';
import messages from '../../Messages';

/**
 * Hook for enabling a rule
 *
 * Makes DELETE request to /ack/{rule_id} to remove the acknowledgment
 * and re-enable the rule. Shows success/error notifications.
 *
 * @returns {Object} { enableRule } - Async function to enable a rule
 */
const useEnableRule = () => {
  const intl = useIntl();
  const axios = useAxiosWithPlatformInterceptors();
  const addNotification = useAddNotification();

  const enableRule = useCallback(
    async (rule_id) => {
      try {
        await axios.delete(`${BASE_URL}/ack/${encodeURI(rule_id)}/`, {
          headers: getCsrfTokenHeader(),
        });

        addNotification({
          variant: 'success',
          timeout: true,
          dismissable: true,
          title: intl.formatMessage(messages.recSuccessfullyEnabled),
        });

        return { success: true };
      } catch (error) {
        addNotification({
          variant: 'danger',
          dismissable: true,
          title: intl.formatMessage(messages.error),
          description: `${error}`,
        });

        return { success: false, error };
      }
    },
    [axios, addNotification, intl],
  );

  return { enableRule };
};

export default useEnableRule;
