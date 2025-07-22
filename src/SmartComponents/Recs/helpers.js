import { SYSTEM_TYPES } from '../../AppConstants';
import { DeleteApi, Get, Post } from '../../Utilities/Api';
import messages from '../../Messages';
import axios from 'axios';
export const ruleResolutionRisk = (rule) => {
  const resolution = rule?.resolution_set?.find(
    (resolution) =>
      resolution.system_type === SYSTEM_TYPES.rhel || SYSTEM_TYPES.ocp,
  );
  return resolution ? resolution.resolution_risk.risk : undefined;
};

export const enableRule = async (
  rule,
  refetch,
  intl,
  addNotification,
  handleModalToggle,
  baseUrl,
) => {
  try {
    await DeleteApi(`${baseUrl}/ack/${encodeURI(rule.rule_id)}/`);
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
  baseUrl,
}) => {
  try {
    const hostAckResponse = (
      await Get(
        `${baseUrl}/hostack/`,
        {},
        { rule_id: rule.rule_id, limit: rule.hosts_acked_count },
      )
    ).data;
    const data = {
      systems: hostAckResponse?.data?.map((item) => item.system_uuid),
    };

    await Post(
      `${baseUrl}/rule/${encodeURI(rule.rule_id)}/unack_hosts/`,
      {},
      data,
    );
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

const getSystemCheckEndpoints = ({ ruleId, pathway, baseUrl }) => {
  if (ruleId && baseUrl) {
    return {
      conventionalURL: `${baseUrl}/rule/${encodeURI(
        ruleId,
      )}/systems_detail/?filter[system_profile][host_type][nil]=true&limit=1`,
      edgeURL: `${baseUrl}/rule/${encodeURI(
        ruleId,
      )}/systems_detail/?filter[system_profile][host_type]=edge&limit=1`,
    };
  }

  return {
    conventionalURL: `${baseUrl}/system/?limit=1&filter[system_profile][host_type][nil]=true&pathway=${pathway}`,
    edgeURL: `${baseUrl}/system/?limit=1&filter[system_profile][host_type]=edge&pathway=${pathway}`,
  };
};

export const edgeSystemsCheck = async (
  ruleId,
  setSystemsCount,
  setEdgeSystemsCount,
  setConventionalSystemsCount,
  setCountsLoading,
  pathway,
  baseUrl,
) => {
  let count = 0;
  const { conventionalURL, edgeURL } = getSystemCheckEndpoints({
    ruleId,
    pathway,
    baseUrl,
  });

  try {
    await axios.get(conventionalURL).then(({ data }) => {
      count = count += data.meta.count;
      setConventionalSystemsCount(data.meta.count);
    });
    await axios.get(edgeURL).then(({ data }) => {
      count = count += data.meta.count;
      setEdgeSystemsCount(data.meta.count);
    });

    setSystemsCount && setSystemsCount(count);
    setCountsLoading(false);
  } catch (error) {
    console.error(error);
    setCountsLoading(false);
  }
};
