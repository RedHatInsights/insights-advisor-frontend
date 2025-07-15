import { useEffect, useState } from 'react';
import { useFlag, useFlagsStatus } from '@unleash/proxy-client-react';
import useChrome from '@redhat-cloud-services/frontend-components/useChrome';
import { BASE_URL, PERMISSIONS } from '../AppConstants';

export const useFeatureFlag = (flag) => {
  const { flagsReady } = useFlagsStatus();
  const isFlagEnabled = useFlag(flag);
  return flagsReady ? isFlagEnabled : false;
};

export const matchPermissions = (permissionA, permissionB) => {
  const segmentsA = permissionA.split(':');
  const segmentsB = permissionB.split(':');

  if (segmentsA.length !== segmentsB.length) {
    return false;
  }

  return segmentsA.every(
    (segmentA, index) =>
      segmentA === segmentsB[index] ||
      segmentA === '*' ||
      segmentsB[index] === '*',
  );
};

/**
 * Checks whether user has particular permissions
 * @param {array} requestedPermissions - array of strings each represening a permission (defined in constants.js > PERMISSIONS)
 * @param app - application to get permissions for
 * @returns {array} - array where first element is an array of bools, representing each permission from parameter array,
 * second element is bool whether permissions are loading
 */
export const useRbac = (requestedPerms) => {
  const [allPerms, setAllPerms] = useState([]);
  const [loading, setLoading] = useState(true);
  const chrome = useChrome();

  useEffect(() => {
    chrome?.getUserPermissions?.().then((permissions) => {
      setAllPerms(permissions);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return [requestedPerms.map(() => []), true];
  }
  return [
    requestedPerms.map((requestedPermission) =>
      allPerms?.some((item) =>
        matchPermissions(item.permission, requestedPermission),
      ),
    ),
    false,
  ];
};

export const useHccEnvironmentContext = () => {
  const chrome = useChrome();

  const [[canExport, canDisableRec, canViewRecs], isRbacLoading] = useRbac([
    PERMISSIONS.export,
    PERMISSIONS.disableRec,
    PERMISSIONS.viewRecs,
  ]);

  return {
    isLoading: isRbacLoading,
    isExportEnabled: canExport,
    isDisableRecEnabled: canDisableRec,
    isAllowedToViewRec: canViewRecs,
    displayGroupsTagsColumns: true,
    displayRuleRatings: true,
    displayRecPathways: true,
    displayExecReportLink: true,
    displayDownloadPlaybookButton: false,
    changeRemediationButtonForIop: false,
    loadChromeless: false,
    updateDocumentTitle: chrome.updateDocumentTitle,
    getUser: chrome.auth.getUser,
    on: chrome.on,
    hideGlobalFilter: chrome.hideGlobalFilter,
    mapGlobalFilter: chrome.mapGlobalFilter,
    globalFilterScope: chrome.globalFilterScope,
    requestPdf: chrome.requestPdf,
    isProd: chrome.isProd,
    BASE_URI: document.baseURI,
    BASE_URL: '/api/insights/v1',
    UI_BASE: './insights',
    RULES_FETCH_URL: `${BASE_URL}/rule/`,
    STATS_SYSTEMS_FETCH_URL: `${BASE_URL}/stats/systems/`,
    STATS_REPORTS_FETCH_URL: `${BASE_URL}/stats/reports/`,
    STATS_OVERVIEW_FETCH_URL: `${BASE_URL}/stats/overview/`,
    SYSTEMS_FETCH_URL: `${BASE_URL}/system/`,
    EDGE_DEVICE_BASE_URL: '/api/edge/v1',
    INVENTORY_BASE_URL: '/api/inventory/v1',
    REMEDIATIONS_BASE_URL: '/api/remediations/v1',
  };
};
