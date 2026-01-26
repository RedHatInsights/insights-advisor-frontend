import React from 'react';
import PropTypes from 'prop-types';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import useChrome from '@redhat-cloud-services/frontend-components/useChrome';
import { useSelfAccessCheck } from '@project-kessel/react-kessel-access-check';
import { useRbac, useHccEnvironmentContext } from './Hooks';
import { BASE_URL, PERMISSIONS } from '../AppConstants';

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

// Test wrapper for TanStack Query
const createQueryWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, cacheTime: 0 },
    },
  });
  const QueryWrapper = ({ children }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  QueryWrapper.propTypes = {
    children: PropTypes.node,
  };
  QueryWrapper.displayName = 'QueryWrapper';
  return QueryWrapper;
};

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
    // Mock workspace fetch for Kessel path (even when disabled, hook is called due to Rules of Hooks)
    jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ data: [{ id: 'ws-1', name: 'Default' }] }),
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should return correct permission booleans once loaded', async () => {
    useChrome.mockReturnValue({
      getUserPermissions: () => Promise.resolve(mockPermissions),
    });

    const { result } = renderHook(
      () =>
        useRbac([
          PERMISSIONS.export,
          PERMISSIONS.disableRec,
          PERMISSIONS.viewRecs,
        ]),
      { wrapper: createQueryWrapper() },
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

    const { result } = renderHook(
      () =>
        useRbac([
          PERMISSIONS.export,
          PERMISSIONS.disableRec,
          PERMISSIONS.viewRecs,
        ]),
      { wrapper: createQueryWrapper() },
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
      const { result } = renderHook(() => useRbac([PERMISSIONS.disableRec]), {
        wrapper: createQueryWrapper(),
      });
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
      const { result } = renderHook(() => useRbac([PERMISSIONS.disableRec]), {
        wrapper: createQueryWrapper(),
      });
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
    // Mock workspace fetch for Kessel path (called by useRbac internally)
    jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ data: [{ id: 'ws-1', name: 'Default' }] }),
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('returns expected environment context values', async () => {
    const { result } = renderHook(() => useHccEnvironmentContext(), {
      wrapper: createQueryWrapper(),
    });

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

describe('useRbac with Kessel enabled', () => {
  let fetchSpy;
  let consoleErrorSpy;
  let consoleWarnSpy;

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock feature flag as enabled
    require('@unleash/proxy-client-react').useFlag.mockReturnValue(true);
    require('@unleash/proxy-client-react').useFlagsStatus.mockReturnValue({
      flagsReady: true,
    });

    // Mock workspace fetch
    fetchSpy = jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({
        data: [{ id: 'ws-1', name: 'Default Workspace' }],
      }),
    });

    // Mock useSelfAccessCheck with default success response
    useSelfAccessCheck.mockReturnValue({
      data: { allowed: true },
      loading: false,
      error: null,
    });

    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
  });

  afterEach(() => {
    fetchSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    consoleWarnSpy.mockRestore();
  });

  it('should check permissions via Kessel SDK for single permission', async () => {
    const { result } = renderHook(() => useRbac([PERMISSIONS.viewRecs]), {
      wrapper: createQueryWrapper(),
    });

    await waitFor(() => expect(result.current[1]).toBe(false));

    expect(result.current[0]).toEqual([true]);
    expect(useSelfAccessCheck).toHaveBeenCalledWith({
      resource: {
        id: 'ws-1',
        type: 'workspace',
      },
      relation: 'advisor_recommendation_view',
    });
  });

  it('should handle bulk permission checks', async () => {
    useSelfAccessCheck.mockReturnValue({
      data: [
        { allowed: true }, // export
        { allowed: false }, // disable
        { allowed: true }, // view
      ],
      loading: false,
      error: null,
    });

    const { result } = renderHook(
      () =>
        useRbac([
          PERMISSIONS.export,
          PERMISSIONS.disableRec,
          PERMISSIONS.viewRecs,
        ]),
      { wrapper: createQueryWrapper() },
    );

    await waitFor(() => expect(result.current[1]).toBe(false));

    expect(result.current[0]).toEqual([true, false, true]);
    expect(useSelfAccessCheck).toHaveBeenCalledWith({
      resources: [
        { id: 'ws-1', type: 'workspace', relation: 'advisor_export_view' },
        {
          id: 'ws-1',
          type: 'workspace',
          relation: 'advisor_recommendation_disable',
        },
        {
          id: 'ws-1',
          type: 'workspace',
          relation: 'advisor_recommendation_view',
        },
      ],
    });
  });

  it('should show loading state while workspace is loading', () => {
    fetchSpy.mockReturnValue(new Promise(() => {})); // Never resolves

    const { result } = renderHook(() => useRbac([PERMISSIONS.viewRecs]), {
      wrapper: createQueryWrapper(),
    });

    expect(result.current[1]).toBe(true);
    expect(result.current[0]).toEqual([false]);
  });

  it('should return false when no workspace is available', async () => {
    fetchSpy.mockResolvedValue({
      ok: true,
      json: async () => ({ data: [] }), // No workspaces
    });

    const { result } = renderHook(() => useRbac([PERMISSIONS.viewRecs]), {
      wrapper: createQueryWrapper(),
    });

    await waitFor(() => expect(result.current[1]).toBe(false));

    expect(result.current[0]).toEqual([false]);
  });

  it('should handle Kessel API errors gracefully', async () => {
    useSelfAccessCheck.mockReturnValue({
      data: null,
      loading: false,
      error: new Error('Kessel API error'),
    });

    const { result } = renderHook(() => useRbac([PERMISSIONS.viewRecs]), {
      wrapper: createQueryWrapper(),
    });

    await waitFor(() => expect(result.current[1]).toBe(false));

    expect(result.current[0]).toEqual([false]);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Kessel permission check error:',
      expect.any(Error),
    );
  });

  it('should warn when permission has no Kessel mapping', async () => {
    const { result } = renderHook(
      () => useRbac(['advisor:unknown:permission']),
      { wrapper: createQueryWrapper() },
    );

    await waitFor(() => expect(result.current[1]).toBe(false));

    expect(consoleWarnSpy).toHaveBeenCalledWith(
      'No Kessel mapping for permission: advisor:unknown:permission',
    );
  });

  it('should show loading when feature flag is not ready', () => {
    require('@unleash/proxy-client-react').useFlagsStatus.mockReturnValue({
      flagsReady: false,
    });

    useChrome.mockReturnValue({
      getUserPermissions: () => new Promise(() => {}), // Never resolves
    });

    const { result } = renderHook(() => useRbac([PERMISSIONS.viewRecs]), {
      wrapper: createQueryWrapper(),
    });

    expect(result.current[1]).toBe(true);
    // When flags aren't ready, falls back to RBAC v1 which is still loading
    expect(result.current[0]).toEqual([[]]);
  });

  it('should show loading while Kessel permission check is in progress', async () => {
    useSelfAccessCheck.mockReturnValue({
      data: null,
      loading: true,
      error: null,
    });

    const { result } = renderHook(() => useRbac([PERMISSIONS.viewRecs]), {
      wrapper: createQueryWrapper(),
    });

    await waitFor(() => {
      expect(result.current[1]).toBe(true);
    });

    expect(result.current[0]).toEqual([false]);
  });

  it('should handle all permissions denied', async () => {
    useSelfAccessCheck.mockReturnValue({
      data: [{ allowed: false }, { allowed: false }, { allowed: false }],
      loading: false,
      error: null,
    });

    const { result } = renderHook(
      () =>
        useRbac([
          PERMISSIONS.export,
          PERMISSIONS.disableRec,
          PERMISSIONS.viewRecs,
        ]),
      { wrapper: createQueryWrapper() },
    );

    await waitFor(() => expect(result.current[1]).toBe(false));

    expect(result.current[0]).toEqual([false, false, false]);
  });
});

describe('useRbac backward compatibility (Kessel disabled)', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Mock feature flag as disabled
    require('@unleash/proxy-client-react').useFlag.mockReturnValue(false);
    require('@unleash/proxy-client-react').useFlagsStatus.mockReturnValue({
      flagsReady: true,
    });

    // Mock workspace fetch (still called even when disabled due to Rules of Hooks)
    jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ data: [{ id: 'ws-1', name: 'Default' }] }),
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should use RBAC v1 path when feature flag is disabled', async () => {
    const mockPermissions = [
      { permission: 'advisor:recommendation-results:read' },
    ];

    useChrome.mockReturnValue({
      getUserPermissions: () => Promise.resolve(mockPermissions),
    });

    const { result } = renderHook(() => useRbac([PERMISSIONS.viewRecs]), {
      wrapper: createQueryWrapper(),
    });

    await waitFor(() => expect(result.current[1]).toBe(false));

    // Should return RBAC v1 result (permission granted)
    expect(result.current[0]).toEqual([true]);
    // Note: useSelfAccessCheck is still called due to Rules of Hooks,
    // but its result is not used when feature flag is disabled
  });

  it('should maintain existing RBAC v1 behavior with multiple permissions', async () => {
    const mockPermissions = [
      { permission: 'advisor:exports:read' },
      { permission: 'advisor:recommendation-results:read' },
    ];

    useChrome.mockReturnValue({
      getUserPermissions: () => Promise.resolve(mockPermissions),
    });

    const { result } = renderHook(
      () =>
        useRbac([
          PERMISSIONS.export,
          PERMISSIONS.disableRec,
          PERMISSIONS.viewRecs,
        ]),
      { wrapper: createQueryWrapper() },
    );

    await waitFor(() => expect(result.current[1]).toBe(false));

    // export: true, disableRec: false, viewRecs: true
    expect(result.current[0]).toEqual([true, false, true]);
  });
});
