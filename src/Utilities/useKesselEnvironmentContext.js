import { useMemo } from 'react';
import useChrome from '@redhat-cloud-services/frontend-components/useChrome';
import { BASE_URL } from '../AppConstants';
import { useFeatureFlag } from './Hooks';
import { useKesselPermissions } from './usePermissionCheck';

export const useKesselEnvironmentContext = () => {
  const chrome = useChrome();
  const isLightspeedEnabled = useFeatureFlag('platform.lightspeed-rebrand');

  const [canExport, canDisableRec, canViewRecs, isKesselLoading] =
    useKesselPermissions();

  return useMemo(
    () => ({
      isLightspeedEnabled,
      isLoading: isKesselLoading,
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
      isKesselLoading,
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
