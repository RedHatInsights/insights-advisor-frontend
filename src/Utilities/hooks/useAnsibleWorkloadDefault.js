import { useEffect, useRef, useState } from 'react';
import useChrome from '@redhat-cloud-services/frontend-components/useChrome';

const WORKLOAD_PARAM = 'workload';
const ANSIBLE_WORKLOAD = 'ansible';

const ANSIBLE_DEFAULT_FILTERS = { workload: [ANSIBLE_WORKLOAD] };

export const useAnsibleWorkloadDefault = () => {
  const { getBundle } = useChrome();
  const isAnsibleBundle = getBundle() === ANSIBLE_WORKLOAD;

  const url = new URL(window.location);
  const hasWorkloadParam = url.searchParams.has(WORKLOAD_PARAM);

  const [isReady, setIsReady] = useState(!isAnsibleBundle || hasWorkloadParam);

  const appliedRef = useRef(false);

  useEffect(() => {
    if (!isAnsibleBundle || appliedRef.current) {
      return;
    }

    appliedRef.current = true;

    const currentUrl = new URL(window.location);
    if (!currentUrl.searchParams.has(WORKLOAD_PARAM)) {
      currentUrl.searchParams.set(WORKLOAD_PARAM, ANSIBLE_WORKLOAD);
      window.history.replaceState(null, null, currentUrl.toString());
    }

    setIsReady(true);
  }, [isAnsibleBundle]);

  const defaultFilters = isAnsibleBundle ? ANSIBLE_DEFAULT_FILTERS : undefined;

  return { isReady, defaultFilters };
};
