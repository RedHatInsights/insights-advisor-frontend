import { SYSTEM_TYPES } from '../../AppConstants';
import messages from '../../Messages';
import { getCsrfTokenHeader } from '../../PresentationalComponents/helper';
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
  axios,
) => {
  try {
    await axios.delete(`${baseUrl}/ack/${encodeURI(rule.rule_id)}/`, {
      headers: getCsrfTokenHeader(),
    });
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
  axios,
}) => {
  try {
    const hostAckResponse = await axios.get(`${baseUrl}/hostack/`, {
      params: { rule_id: rule.rule_id, limit: rule.hosts_acked_count },
    });
    const data = {
      systems: hostAckResponse?.map((item) => item.system_uuid),
    };

    await axios.post(
      `${baseUrl}/rule/${encodeURI(rule.rule_id)}/unack_hosts/`,
      data,
      { headers: getCsrfTokenHeader() },
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
      )}/systems_detail/?filter[system_profile]=true&limit=1`,
      edgeURL: `${baseUrl}/rule/${encodeURI(
        ruleId,
      )}/systems_detail/?filter[system_profile]&limit=1`,
    };
  }

  return {
    conventionalURL: `${baseUrl}/system/?limit=1&filter[system_profile]&pathway=${pathway}`,
    edgeURL: `${baseUrl}/system/?limit=1&filter[system_profile]&pathway=${pathway}`,
  };
};

export const systemsCheck = async (
  ruleId,
  setSystemsCount,
  setConventionalSystemsCount,
  setCountsLoading,
  pathway,
  baseUrl,
  axios,
) => {
  let count = 0;
  const { conventionalURL } = getSystemCheckEndpoints({
    ruleId,
    pathway,
    baseUrl,
  });

  try {
    await axios.get(conventionalURL).then((data) => {
      count = count += data.meta.count;
      setConventionalSystemsCount &&
        setConventionalSystemsCount(data.meta.count);
    });

    setSystemsCount && setSystemsCount(count);
    setCountsLoading(false);
  } catch (error) {
    console.error(error);
    setCountsLoading(false);
  }
};
