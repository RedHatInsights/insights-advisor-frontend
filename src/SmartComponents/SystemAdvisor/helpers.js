import { getCsrfTokenHeader } from '../../PresentationalComponents/helper';

/**
 * Check if error is an abort/cancellation error
 * @param {Error} error - Error object to check
 * @returns {boolean} True if error is AbortError or CanceledError
 */
export const isAbortError = (error) =>
  error?.name === 'AbortError' || error?.name === 'CanceledError';

/**
 * Fetches remediation resolution options for selected rules
 * @param {Array<{rule: Object}>} selectedRules - Array of rule objects with rule details
 * @param {string} hostId - System host ID
 * @param {string} hostName - System host name
 * @param {AbortSignal} signal - Abort signal for request cancellation
 * @returns {Promise<Array>} Array of resolution objects for IOP modal
 * @throws {Error} Re-throws AbortError and CanceledError, returns [] for other errors
 */
export const fetchResolutionsData = async (
  selectedRules,
  hostId,
  hostName,
  signal,
) => {
  const formattedIssues = selectedRules.map(
    (rule) => 'advisor:' + rule.rule.rule_id,
  );

  try {
    const response = await fetch(
      '/insights_cloud/api/remediations/v1/resolutions',
      {
        method: 'POST',
        headers: {
          'content-type': 'application/json; charset=utf-8',
          ...getCsrfTokenHeader(),
        },
        body: JSON.stringify({ issues: formattedIssues }),
        signal,
      },
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    const resolutionsData = selectedRules.map((rule) => {
      const apiLookupKey = 'advisor:' + rule.rule.rule_id;
      const matchingKey = Object.keys(data).find((key) =>
        key.startsWith(apiLookupKey),
      );

      const ruleData = matchingKey ? data[matchingKey] : {};
      const resolutions = ruleData?.resolutions || [];
      const rebootRequired = rule.rule.reboot_required;
      const rulename = rule.rule.rule_id;
      const ruleDescription = rule.rule.description;

      return {
        hostid: hostId,
        host_name: hostName,
        rulename: rulename,
        resolutions: resolutions,
        rebootable: rebootRequired,
        description: ruleDescription,
      };
    });

    return resolutionsData;
  } catch (err) {
    if (isAbortError(err)) {
      throw err;
    }
    console.error('An error occurred during fetch:', err);
    return [];
  }
};
