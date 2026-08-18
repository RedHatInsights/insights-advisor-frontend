import { renderHook } from '@testing-library/react';
import useChrome from '@redhat-cloud-services/frontend-components/useChrome';
import { useAnsibleWorkloadDefault } from './useAnsibleWorkloadDefault';

jest.mock('@redhat-cloud-services/frontend-components/useChrome', () => ({
  __esModule: true,
  default: jest.fn(),
}));

const setUrl = (path) => {
  window.history.pushState({}, '', path);
};

describe('useAnsibleWorkloadDefault', () => {
  let replaceStateSpy;

  beforeEach(() => {
    jest.clearAllMocks();
    replaceStateSpy = jest
      .spyOn(window.history, 'replaceState')
      .mockImplementation(() => {});
    setUrl('/ansible/advisor/recommendations');
  });

  afterEach(() => {
    replaceStateSpy.mockRestore();
    setUrl('/');
  });

  it('returns ready immediately with no defaultFilters for non-ansible bundles', () => {
    useChrome.mockReturnValue({ getBundle: () => 'insights' });

    const { result } = renderHook(() => useAnsibleWorkloadDefault());

    expect(result.current.isReady).toBe(true);
    expect(result.current.defaultFilters).toBeUndefined();
    expect(replaceStateSpy).not.toHaveBeenCalled();
  });

  it('sets workload param in URL and returns defaultFilters for ansible bundle', () => {
    useChrome.mockReturnValue({ getBundle: () => 'ansible' });

    const { result } = renderHook(() => useAnsibleWorkloadDefault());

    expect(result.current.isReady).toBe(true);
    expect(result.current.defaultFilters).toEqual({
      workload: ['ansible'],
    });
    expect(replaceStateSpy).toHaveBeenCalledTimes(1);
    const updatedUrl = replaceStateSpy.mock.calls[0][2];
    expect(updatedUrl).toContain('workload=ansible');
  });

  it('does not overwrite existing workload param for ansible bundle', () => {
    setUrl('/ansible/advisor/recommendations?workload=crowdstrike');
    useChrome.mockReturnValue({ getBundle: () => 'ansible' });

    const { result } = renderHook(() => useAnsibleWorkloadDefault());

    expect(result.current.isReady).toBe(true);
    expect(result.current.defaultFilters).toEqual({
      workload: ['ansible'],
    });
    expect(replaceStateSpy).not.toHaveBeenCalled();
  });

  it('does not modify URL for non-ansible bundle even with no workload param', () => {
    setUrl('/insights/advisor/recommendations');
    useChrome.mockReturnValue({ getBundle: () => 'insights' });

    const { result } = renderHook(() => useAnsibleWorkloadDefault());

    expect(result.current.isReady).toBe(true);
    expect(result.current.defaultFilters).toBeUndefined();
    expect(replaceStateSpy).not.toHaveBeenCalled();
  });

  it('applies workload param only once across re-renders', () => {
    useChrome.mockReturnValue({ getBundle: () => 'ansible' });

    const { result, rerender } = renderHook(() => useAnsibleWorkloadDefault());

    expect(replaceStateSpy).toHaveBeenCalledTimes(1);

    rerender();
    rerender();

    expect(replaceStateSpy).toHaveBeenCalledTimes(1);
    expect(result.current.isReady).toBe(true);
  });
});
