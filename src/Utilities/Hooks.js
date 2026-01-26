import { useEffect, useState, useMemo } from 'react';
import { useFlag, useFlagsStatus } from '@unleash/proxy-client-react';
import useChrome from '@redhat-cloud-services/frontend-components/useChrome';
import { BASE_URL, PERMISSIONS } from '../AppConstants';
import { useSelfAccessCheck } from '@project-kessel/react-kessel-access-check';
import { useDefaultWorkspace } from './useKesselWorkspaces';

// Permission mapping from RBAC v1 to Kessel v2 relations
const PERMISSION_MAP = {
  'advisor:exports:read': 'advisor_export_view',
  'advisor:disable-recommendations:write': 'advisor_recommendation_disable',
  'advisor:recommendation-results:read': 'advisor_recommendation_view',
};

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
 * Maps RBAC v1 permissions to Kessel v2 resource relations
 * @param {array} permissions - RBAC v1 permission strings
 * @param {string} workspaceId - Workspace ID to check permissions against
 * @returns {array} Array of Kessel resource objects { id, type, relation }
 */
const mapPermissionsToKessel = (permissions, workspaceId) =>
  permissions
    .map((perm) => {
      const relation = PERMISSION_MAP[perm];
      if (!relation) {
        console.warn(`No Kessel mapping for permission: ${perm}`);
        return null;
      }
      return { id: workspaceId, type: 'workspace', relation };
    })
    .filter(Boolean);

/**
 * Kessel-based permission checker using useSelfAccessCheck
 * @param {array} requestedPerms - array of permission strings
 * @returns {array} [arrayOfBools, isLoading] matching useRbac signature
 */
const useKesselRbac = (requestedPerms) => {
  const { workspaceId, isLoading: workspaceLoading } = useDefaultWorkspace();

  const resources = workspaceId
    ? mapPermissionsToKessel(requestedPerms, workspaceId)
    : [];

  const isSingleResource = resources.length === 1;
  const hasResources = resources.length > 0;

  // Build check params for useSelfAccessCheck
  // Single check: { resource: { id, type }, relation }
  // Bulk check: { resources: [{ id, type, relation }, ...] }
  const checkParams = hasResources
    ? isSingleResource
      ? {
          resource: { id: resources[0].id, type: resources[0].type },
          relation: resources[0].relation,
        }
      : { resources }
    : { resources: [] };

  const { data, loading, error } = useSelfAccessCheck(checkParams);

  // Return early if workspace is still loading
  if (workspaceLoading) {
    return [requestedPerms.map(() => false), true];
  }

  // No workspace available
  if (!workspaceId) {
    return [requestedPerms.map(() => false), false];
  }

  // Still loading permission check
  if (loading) {
    return [requestedPerms.map(() => false), true];
  }

  // Error during permission check
  if (error) {
    console.error('Kessel permission check error:', error);
    return [requestedPerms.map(() => false), false];
  }

  // Evaluate access based on response type
  let permissionResults;
  if (isSingleResource) {
    // Single resource check - return single boolean for the one permission
    permissionResults = [data?.allowed ?? false];
  } else {
    // Bulk resource check - map each result to a boolean
    permissionResults = Array.isArray(data)
      ? data.map((check) => check.allowed ?? false)
      : requestedPerms.map(() => false);
  }

  return [permissionResults, false];
};

/**
 * Checks whether user has particular permissions (RBAC v1)
 * @param {array} requestedPerms - array of strings each representing a permission (defined in constants.js > PERMISSIONS)
 * @param app - application to get permissions for
 * @returns {array} - array where first element is an array of bools, representing each permission from parameter array,
 * second element is bool whether permissions are loading
 */
const useRbacV1 = (requestedPerms, app = 'advisor') => {
  const [allPerms, setAllPerms] = useState([]);
  const [loading, setLoading] = useState(true);
  const chrome = useChrome();

  useEffect(() => {
    const permissionsFunc =
      chrome?.getUserPermissions || chrome?.auth?.getUserPermissions;
    permissionsFunc?.(app).then((permissions) => {
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

/**
 * Universal permission checker that switches between RBAC v1 and Kessel v2
 * based on 'hbi.kessel-migration' feature flag
 * @param {array} requestedPerms - array of permission strings
 * @param {string} app - application name (default: 'advisor')
 * @returns {array} [arrayOfBools, isLoading]
 */
export const useRbac = (requestedPerms, app = 'advisor') => {
  const isKesselEnabled = useFeatureFlag('hbi.kessel-migration');

  // Call both hooks unconditionally (Rules of Hooks)
  const rbacV1Result = useRbacV1(requestedPerms, app);
  const kesselResult = useKesselRbac(requestedPerms);

  // Return based on feature flag
  if (isKesselEnabled === undefined) {
    return [requestedPerms.map(() => false), true];
  }

  return isKesselEnabled ? kesselResult : rbacV1Result;
};

export const useHccEnvironmentContext = () => {
  const chrome = useChrome();
  const isLightspeedEnabled = useFeatureFlag('platform.lightspeed-rebrand');

  const [[canExport, canDisableRec, canViewRecs], isRbacLoading] = useRbac([
    PERMISSIONS.export,
    PERMISSIONS.disableRec,
    PERMISSIONS.viewRecs,
  ]);

  return useMemo(
    () => ({
      isLightspeedEnabled,
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
    }),
    [
      isLightspeedEnabled,
      isRbacLoading,
      canExport,
      canDisableRec,
      canViewRecs,
      chrome.updateDocumentTitle,
      chrome.auth.getUser,
      chrome.on,
      chrome.hideGlobalFilter,
      chrome.mapGlobalFilter,
      chrome.globalFilterScope,
      chrome.requestPdf,
      chrome.isProd,
    ],
  );
};
