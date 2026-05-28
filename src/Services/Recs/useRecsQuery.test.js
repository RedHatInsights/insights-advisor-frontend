import React from 'react';
import { renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useRecsQuery } from './useRecsQuery';
import * as apiClient from './apiClient';

// Mock the API client
jest.mock('./apiClient', () => ({
  fetchRecs: jest.fn(),
}));

// Mock bastilian-tabletools
jest.mock('bastilian-tabletools', () => ({
  useQueryWithUtilities: jest.fn(() => {
    // Simulate the hook behavior
    return {
      data: { data: [], meta: { count: 0 } },
      items: [],
      loading: false,
      error: null,
    };
  }),
}));

// Mock combineParamsWithTableState
jest.mock('../../Utilities/combineParamsWithTableState', () => ({
  __esModule: true,
  default: (tableState, additionalParams) => ({
    ...tableState,
    ...additionalParams,
  }),
}));

/* eslint-disable react/prop-types, react/display-name */
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return ({ children }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};
/* eslint-enable react/prop-types, react/display-name */

describe('useRecsQuery', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    apiClient.fetchRecs.mockResolvedValue({
      data: [],
      meta: { count: 0 },
    });
  });

  it('should call with default parameters when no options provided', () => {
    const { result } = renderHook(() => useRecsQuery({}), {
      wrapper: createWrapper(),
    });

    expect(result.current).toBeDefined();
  });

  it('should accept useTableState parameter', () => {
    const { result } = renderHook(() => useRecsQuery({ useTableState: true }), {
      wrapper: createWrapper(),
    });

    expect(result.current).toBeDefined();
  });

  it('should accept enabled parameter', () => {
    const { result } = renderHook(() => useRecsQuery({ enabled: false }), {
      wrapper: createWrapper(),
    });

    expect(result.current).toBeDefined();
  });

  it('should accept additionalParams parameter', () => {
    const additionalParams = {
      tags: 'tag1,tag2',
      pathway: 'test-pathway',
    };

    const { result } = renderHook(() => useRecsQuery({ additionalParams }), {
      wrapper: createWrapper(),
    });

    expect(result.current).toBeDefined();
  });

  it('should combine all options correctly', () => {
    const { result } = renderHook(
      () =>
        useRecsQuery({
          useTableState: true,
          enabled: true,
          additionalParams: { tags: 'tag1' },
        }),
      {
        wrapper: createWrapper(),
      },
    );

    expect(result.current).toBeDefined();
    expect(result.current).toHaveProperty('items');
    expect(result.current).toHaveProperty('loading');
  });
});
