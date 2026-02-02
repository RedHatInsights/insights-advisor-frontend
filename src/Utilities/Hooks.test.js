import { renderHook, waitFor } from '@testing-library/react';
import useChrome from '@redhat-cloud-services/frontend-components/useChrome';
import {
  useRbac,
  useHccEnvironmentContext,
  useIopEnvironmentContext,
} from './Hooks';
import {
  BASE_URL,
  PERMISSIONS,
  IOP_ENVIRONMENT_CONTEXT,
} from '../AppConstants';

jest.mock('@redhat-cloud-services/frontend-components/useChrome', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('@unleash/proxy-client-react', () => ({
  ...jest.requireActual('@unleash/proxy-client-react'),
  useFlagsStatus: jest.fn(() => ({
    flagsReady: true,
  })),
  useFlag: jest.fn(() => false),
}));

describe('useRbac', () => {
  const mockPermissions = [
    { permission: 'advisor:export' },
    { permission: 'advisor:disableRec' },
  ];
  const mockPermissionsDisableRecTrue = [
    { permission: 'advisor:exports-read' },
    { permission: 'advisor:disable-recommendations:write' },
    { permission: 'advisor:recommendation-results:read' },
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

  it('should handle getUserPermissions from chrome or chrome.auth', async () => {
    const getUserPermissionsFunc = [
      {
        auth: {
          getUserPermissions: () =>
            Promise.resolve(mockPermissionsDisableRecTrue),
        },
      },
      {
        getUserPermissions: () =>
          Promise.resolve(mockPermissionsDisableRecTrue),
      },
    ];

    for (const func of getUserPermissionsFunc) {
      useChrome.mockReturnValue(func);
      const { result } = renderHook(() => useRbac([PERMISSIONS.disableRec]));
      await waitFor(() => {
        expect(result.current[1]).toBe(false);
      });
      expect(result.current[0]).toEqual([true]);
    }
  });

  it('should handle getUserPermissions not available or undefined', async () => {
    const getUserPermissionsFunc = [{}, undefined];

    for (const func of getUserPermissionsFunc) {
      useChrome.mockReturnValue(func);
      const { result } = renderHook(() => useRbac([PERMISSIONS.disableRec]));
      // Should remain in loading state since permissions function isn't available
      expect(result.current[1]).toBe(true);
      expect(result.current[0]).toEqual([[]]);
    }
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
      isLightspeedEnabled: false,
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

describe('useIopEnvironmentContext', () => {
  const mockChrome = {
    getUserPermissions: () =>
      Promise.resolve([
        { permission: 'advisor:disable-recommendations:write' },
        { permission: 'advisor:recommendation-results:read' },
      ]),
    updateDocumentTitle: jest.fn(),
    auth: { getUser: jest.fn() },
    on: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    useChrome.mockReturnValue(mockChrome);
  });

  it('returns expected IOP environment context values with permissions', async () => {
    const { result } = renderHook(() => useIopEnvironmentContext());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current).toEqual({
      ...IOP_ENVIRONMENT_CONTEXT,
      isLoading: false,
      isDisableRecEnabled: true,
      isAllowedToViewRec: true,
    });
  });

  it('returns expected IOP environment context values without permissions', async () => {
    useChrome.mockReturnValue({
      getUserPermissions: () => Promise.resolve([]),
      auth: { getUser: jest.fn() },
    });

    const { result } = renderHook(() => useIopEnvironmentContext());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current).toEqual({
      ...IOP_ENVIRONMENT_CONTEXT,
      isLoading: false,
      isDisableRecEnabled: false,
      isAllowedToViewRec: false,
    });
  });

  it('returns loading state initially', () => {
    useChrome.mockReturnValue({
      getUserPermissions: () => new Promise(() => {}),
      auth: { getUser: jest.fn() },
    });

    const { result } = renderHook(() => useIopEnvironmentContext());

    expect(result.current.isLoading).toBe(true);
    expect(result.current.isDisableRecEnabled).toEqual([]);
    expect(result.current.isAllowedToViewRec).toEqual([]);
  });

  it('returns partial permissions when user has only view permission', async () => {
    useChrome.mockReturnValue({
      getUserPermissions: () =>
        Promise.resolve([
          { permission: 'advisor:recommendation-results:read' },
        ]),
      auth: { getUser: jest.fn() },
    });

    const { result } = renderHook(() => useIopEnvironmentContext());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.isDisableRecEnabled).toBe(false);
    expect(result.current.isAllowedToViewRec).toBe(true);
  });

  it('returns partial permissions when user has only disable permission', async () => {
    useChrome.mockReturnValue({
      getUserPermissions: () =>
        Promise.resolve([
          { permission: 'advisor:disable-recommendations:write' },
        ]),
      auth: { getUser: jest.fn() },
    });

    const { result } = renderHook(() => useIopEnvironmentContext());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.isDisableRecEnabled).toBe(true);
    expect(result.current.isAllowedToViewRec).toBe(false);
  });
});
