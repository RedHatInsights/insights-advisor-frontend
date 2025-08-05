export const fetchResolutionsData = async (selectedRules, hostId, hostName) => {
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
          'X-CSRF-Token': document
            .querySelector('meta[name="csrf-token"]')
            .getAttribute('content'),
        },
        body: JSON.stringify({ issues: formattedIssues }),
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
    console.error('An error occurred during fetch:', err);
    return [];
  }
};
