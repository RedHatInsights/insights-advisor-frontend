import { renderHook, waitFor } from '@testing-library/react';
import useChrome from '@redhat-cloud-services/frontend-components/useChrome';
import { useRbac, useHccEnvironmentContext } from './Hooks';
import { BASE_URL, PERMISSIONS } from '../AppConstants';

jest.mock('@redhat-cloud-services/frontend-components/useChrome', () => ({
  __esModule: true,
  default: jest.fn(),
}));

describe('useRbac', () => {
  const mockPermissions = [
    { permission: 'advisor:export' },
    { permission: 'advisor:disableRec' },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return correct permission booleans once loaded', async () => {
    useChrome.mockReturnValue({
      getUserPermissions: () => Promise.resolve(mockPermissions),
    });

    const { result } = renderHook(() =>
      useRbac([
        PERMISSIONS.export,
        PERMISSIONS.disableRec,
        PERMISSIONS.viewRecs,
      ]),
    );

    await waitFor(() => {
      expect(result.current[1]).toBe(false);
    });

    expect(result.current[0]).toEqual([false, false, false]);
  });

  it('should show loading initially', () => {
    useChrome.mockReturnValue({
      getUserPermissions: () => new Promise(() => {}),
    });

    const { result } = renderHook(() =>
      useRbac([
        PERMISSIONS.export,
        PERMISSIONS.disableRec,
        PERMISSIONS.viewRecs,
      ]),
    );

    expect(result.current[1]).toBe(true);
    expect(result.current[0]).toEqual([[], [], []]);
  });
});

describe('useHccEnvironmentContext', () => {
  const mockChrome = {
    getUserPermissions: () =>
      Promise.resolve([
        { permission: 'advisor:export' },
        { permission: 'advisor:viewRecs' },
      ]),
    updateDocumentTitle: jest.fn(),
    auth: { getUser: jest.fn() },
    on: jest.fn(),
    hideGlobalFilter: jest.fn(),
    mapGlobalFilter: jest.fn(),
    globalFilterScope: 'global',
    requestPdf: jest.fn(),
    isProd: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    useChrome.mockReturnValue(mockChrome);
  });

  it('returns expected environment context values', async () => {
    const { result } = renderHook(() => useHccEnvironmentContext());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current).toEqual({
      isLoading: false,
      isExportEnabled: false,
      isDisableRecEnabled: false,
      isAllowedToViewRec: false,
      displayGroupsTagsColumns: true,
      displayRuleRatings: true,
      displayRecPathways: true,
      displayExecReportLink: true,
      displayDownloadPlaybookButton: false,
      changeRemediationButtonForIop: false,
      loadChromeless: false,
      updateDocumentTitle: mockChrome.updateDocumentTitle,
      getUser: mockChrome.auth.getUser,
      on: mockChrome.on,
      hideGlobalFilter: mockChrome.hideGlobalFilter,
      mapGlobalFilter: mockChrome.mapGlobalFilter,
      globalFilterScope: mockChrome.globalFilterScope,
      requestPdf: mockChrome.requestPdf,
      isProd: true,
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
    });
  });
});
