import { renderHook } from '@testing-library/react';
import { useKesselEnvironmentContext } from './useKesselEnvironmentContext';
import { useFeatureFlag } from './Hooks';
import { useKesselPermissions } from './usePermissionCheck';

jest.mock('./Hooks', () => ({
  ...jest.requireActual('./Hooks'),
  useFeatureFlag: jest.fn(),
}));

jest.mock('./usePermissionCheck', () => ({
  useKesselPermissions: jest.fn(),
}));

describe('useKesselEnvironmentContext', () => {
  beforeEach(() => {
    useFeatureFlag.mockReturnValue(false);
    useKesselPermissions.mockReturnValue([true, true, true, false]);
  });

  it('should return environment context with Kessel permissions', () => {
    const { result } = renderHook(() => useKesselEnvironmentContext());

    expect(result.current).toEqual(
      expect.objectContaining({
        isExportEnabled: true,
        isDisableRecEnabled: true,
        isAllowedToViewRec: true,
        isLoading: false,
      }),
    );
  });

  it('should handle loading state from Kessel permissions', () => {
    useKesselPermissions.mockReturnValue([false, false, false, true]);

    const { result } = renderHook(() => useKesselEnvironmentContext());

    expect(result.current.isLoading).toBe(true);
  });

  it('should include feature flags', () => {
    useFeatureFlag.mockReturnValue(true);

    const { result } = renderHook(() => useKesselEnvironmentContext());

    expect(result.current.isLightspeedEnabled).toBe(true);
  });

  it('should include chrome methods', () => {
    const { result } = renderHook(() => useKesselEnvironmentContext());

    expect(result.current.updateDocumentTitle).toBeDefined();
    expect(result.current.getUser).toBeDefined();
    expect(result.current.on).toBeDefined();
    expect(result.current.hideGlobalFilter).toBeUndefined(); // Not in mock
    expect(result.current.mapGlobalFilter).toBeUndefined(); // Not in mock
    expect(result.current.globalFilterScope).toBeUndefined(); // Not in mock
    expect(result.current.requestPdf).toBeUndefined(); // Not in mock
    expect(result.current.isProd).toBeUndefined(); // Not in mock
  });

  it('should include display configuration', () => {
    const { result } = renderHook(() => useKesselEnvironmentContext());

    expect(result.current).toEqual(
      expect.objectContaining({
        displayGroupsTagsColumns: true,
        displayRuleRatings: true,
        displayRecPathways: true,
        displayExecReportLink: true,
        displayDownloadPlaybookButton: false,
        changeRemediationButtonForIop: false,
        loadChromeless: false,
      }),
    );
  });

  it('should include API URLs', () => {
    const { result } = renderHook(() => useKesselEnvironmentContext());

    expect(result.current).toEqual(
      expect.objectContaining({
        BASE_URL: '/api/insights/v1',
        UI_BASE: './insights',
        RULES_FETCH_URL: '/api/insights/v1/rule/',
        STATS_SYSTEMS_FETCH_URL: '/api/insights/v1/stats/systems/',
        STATS_REPORTS_FETCH_URL: '/api/insights/v1/stats/reports/',
        STATS_OVERVIEW_FETCH_URL: '/api/insights/v1/stats/overview/',
        SYSTEMS_FETCH_URL: '/api/insights/v1/system/',
        EDGE_DEVICE_BASE_URL: '/api/edge/v1',
        INVENTORY_BASE_URL: '/api/inventory/v1',
        REMEDIATIONS_BASE_URL: '/api/remediations/v1',
      }),
    );
  });

  it('should handle partial permissions correctly', () => {
    useKesselPermissions.mockReturnValue([true, false, true, false]);

    const { result } = renderHook(() => useKesselEnvironmentContext());

    expect(result.current.isExportEnabled).toBe(true);
    expect(result.current.isDisableRecEnabled).toBe(false);
    expect(result.current.isAllowedToViewRec).toBe(true);
  });

  it('should handle no permissions', () => {
    useKesselPermissions.mockReturnValue([false, false, false, false]);

    const { result } = renderHook(() => useKesselEnvironmentContext());

    expect(result.current.isExportEnabled).toBe(false);
    expect(result.current.isDisableRecEnabled).toBe(false);
    expect(result.current.isAllowedToViewRec).toBe(false);
  });
});
