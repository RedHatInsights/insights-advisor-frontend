import { renderHook } from '@testing-library/react';
import { usePathwaysQuery } from './usePathwaysQuery';
import { useQueryWithUtilities } from 'bastilian-tabletools';
import { fetchPathways } from './apiClient';
import { combineParamsWithTableState } from '../../Utilities/combineParamsWithTableState';

jest.mock('bastilian-tabletools');
jest.mock('./apiClient');
jest.mock('../../Utilities/combineParamsWithTableState');

describe('usePathwaysQuery', () => {
  const mockUseQueryWithUtilities = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    useQueryWithUtilities.mockImplementation(mockUseQueryWithUtilities);
    mockUseQueryWithUtilities.mockReturnValue({
      items: jest.fn(),
      loading: false,
    });
  });

  it('should call useQueryWithUtilities with correct default options', () => {
    renderHook(() => usePathwaysQuery());

    expect(mockUseQueryWithUtilities).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: ['pathways'],
        enabled: true,
        useTableState: false,
        params: {},
        combineParamsWithTableState,
      }),
    );
  });

  it('should pass useTableState option', () => {
    renderHook(() => usePathwaysQuery({ useTableState: true }));

    expect(mockUseQueryWithUtilities).toHaveBeenCalledWith(
      expect.objectContaining({
        useTableState: true,
      }),
    );
  });

  it('should pass enabled option', () => {
    renderHook(() => usePathwaysQuery({ enabled: false }));

    expect(mockUseQueryWithUtilities).toHaveBeenCalledWith(
      expect.objectContaining({
        enabled: false,
      }),
    );
  });

  it('should pass additionalParams as params', () => {
    const additionalParams = { tags: 'tag1,tag2', SAP: true };
    renderHook(() => usePathwaysQuery({ additionalParams }));

    expect(mockUseQueryWithUtilities).toHaveBeenCalledWith(
      expect.objectContaining({
        params: additionalParams,
      }),
    );
  });

  it('should include fetchFn that calls fetchPathways', async () => {
    const mockData = { data: [], meta: { count: 0 } };
    fetchPathways.mockResolvedValue(mockData);

    renderHook(() => usePathwaysQuery());

    const callArgs = mockUseQueryWithUtilities.mock.calls[0][0];
    const fetchFn = callArgs.fetchFn;

    const result = await fetchFn({ offset: 0, limit: 20 });

    expect(fetchPathways).toHaveBeenCalledWith({ offset: 0, limit: 20 });
    expect(result).toEqual(mockData);
  });

  it('should return useQueryWithUtilities result', () => {
    const mockResult = {
      items: jest.fn(),
      loading: false,
      error: null,
    };
    mockUseQueryWithUtilities.mockReturnValue(mockResult);

    const { result } = renderHook(() => usePathwaysQuery());

    expect(result.current).toEqual(mockResult);
  });

  it('should handle all options together', () => {
    const options = {
      useTableState: true,
      enabled: false,
      additionalParams: { category: ['1'] },
    };

    renderHook(() => usePathwaysQuery(options));

    expect(mockUseQueryWithUtilities).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: ['pathways'],
        enabled: false,
        useTableState: true,
        params: { category: ['1'] },
        combineParamsWithTableState,
      }),
    );
  });
});
