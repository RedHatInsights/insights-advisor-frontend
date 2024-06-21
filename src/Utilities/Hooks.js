import { useFlag, useFlagsStatus } from '@unleash/proxy-client-react';

export const useFeatureFlag = (flag) => {
  const { flagsReady } = useFlagsStatus();
  const isFlagEnabled = useFlag(flag);
  return flagsReady ? isFlagEnabled : false;
};

export const useWorkspaceFeatureFlag = () =>
  useFeatureFlag('platform.rbac.groups-to-workspaces-rename');
