export const hasPlaybook = (pathwayRules = []) => {
  let hasPlaybook = false;
  if (pathwayRules.length > 0) {
    for (let i = 0; i < pathwayRules.length; i++) {
      if (pathwayRules[i].resolution_set[0].has_playbook) {
        return (hasPlaybook = true);
      }
    }
  }
  return hasPlaybook;
};
