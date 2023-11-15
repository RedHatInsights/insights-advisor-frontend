import { SYSTEM_TYPES, BASE_URL } from '../../AppConstants';
import { DeleteApi, Get, Post } from '../../Utilities/Api';
import messages from '../../Messages';
import axios from 'axios';
export const ruleResolutionRisk = (rule) => {
  const resolution = rule?.resolution_set?.find(
    (resolution) =>
      resolution.system_type === SYSTEM_TYPES.rhel || SYSTEM_TYPES.ocp
  );
  return resolution ? resolution.resolution_risk.risk : undefined;
};

export const enableRule = async (
  rule,
  refetch,
  intl,
  addNotification,
  handleModalToggle
) => {
  try {
    await DeleteApi(`${BASE_URL}/ack/${rule.rule_id}/`);
    addNotification({
      variant: 'success',
      timeout: true,
      dismissable: true,
      title: intl.formatMessage(messages.recSuccessfullyEnabled),
    });
    refetch();
  } catch (error) {
    handleModalToggle(false);
    addNotification({
      variant: 'danger',
      dismissable: true,
      title: intl.formatMessage(messages.error),
      description: `${error}`,
    });
  }
};

export const bulkHostActions = async ({
  refetch,
  addNotification,
  intl,
  rule,
}) => {
  try {
    const hostAckResponse = (
      await Get(
        `${BASE_URL}/hostack/`,
        {},
        { rule_id: rule.rule_id, limit: rule.hosts_acked_count }
      )
    ).data;
    const data = {
      systems: hostAckResponse?.data?.map((item) => item.system_uuid),
    };

    await Post(`${BASE_URL}/rule/${rule.rule_id}/unack_hosts/`, {}, data);
    refetch();
    addNotification({
      variant: 'success',
      timeout: true,
      dismissable: true,
      title: intl.formatMessage(messages.recSuccessfullyEnabled),
    });
  } catch (error) {
    addNotification({
      variant: 'danger',
      dismissable: true,
      title: intl.formatMessage(messages.error),
      description: `${error}`,
    });
  }
};

export const edgeSystemsCheck = async (ruleId, setSystemsCount) => {
  let count = 0;
  try {
    await axios
      .get(
        `/api/insights/v1/rule/${ruleId}/systems_detail/?filter[system_profile][host_type][nil]=true`
      )
      .then(({ data }) => {
        count = count += data.meta.count;
      });
    await axios
      .get(
        `/api/insights/v1/rule/${ruleId}/systems_detail/?filter[system_profile][host_type][edge]=true`
      )
      .then(({ data }) => {
        count = count += data.meta.count;
      });

    setSystemsCount(count);
  } catch (error) {
    console.error(error);
  }
};
