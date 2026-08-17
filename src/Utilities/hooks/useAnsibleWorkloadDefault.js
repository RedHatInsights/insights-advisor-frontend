import { useLayoutEffect } from 'react';
import useChrome from '@redhat-cloud-services/frontend-components/useChrome';

const WORKLOAD_PARAM = 'workload';
const ANSIBLE_WORKLOAD = 'ansible';

const ANSIBLE_DEFAULT_FILTERS = { workload: [ANSIBLE_WORKLOAD] };

export const useAnsibleWorkloadDefault = () => {
  const { getBundle } = useChrome();
  const isAnsibleBundle = getBundle() === ANSIBLE_WORKLOAD;

  useLayoutEffect(() => {
    if (!isAnsibleBundle) return;

    const url = new URL(window.location);
    if (!url.searchParams.has(WORKLOAD_PARAM)) {
      url.searchParams.set(WORKLOAD_PARAM, ANSIBLE_WORKLOAD);
      window.history.replaceState(window.history.state, '', url.toString());
    }
  }, [isAnsibleBundle]);

  return {
    isReady: true,
    defaultFilters: isAnsibleBundle ? ANSIBLE_DEFAULT_FILTERS : undefined,
  };
};
