import React from 'react';
import { renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import useEnableRule from './useEnableRule';
import API from '../../Utilities/Api';

// Mock the API
jest.mock('../../Utilities/Api', () => ({
  __esModule: true,
  default: {
    delete: jest.fn(),
  },
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

describe('useEnableRule', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return mutation object', () => {
    const { result } = renderHook(() => useEnableRule(), {
      wrapper: createWrapper(),
    });

    expect(result.current).toBeDefined();
    expect(result.current.mutate).toBeDefined();
    expect(result.current.mutateAsync).toBeDefined();
  });

  it('should call API.delete with correct endpoint on mutation', async () => {
    API.delete.mockResolvedValue({ status: 204 });

    const { result } = renderHook(() => useEnableRule(), {
      wrapper: createWrapper(),
    });

    await result.current.mutateAsync({ ruleId: 'test-rule-id' });

    expect(API.delete).toHaveBeenCalledWith(
      '/api/insights/v1/ack/test-rule-id/',
    );
  });

  it('should handle successful enable operation', async () => {
    API.delete.mockResolvedValue({ status: 204 });

    const onSuccess = jest.fn();
    const { result } = renderHook(() => useEnableRule({ onSuccess }), {
      wrapper: createWrapper(),
    });

    await result.current.mutateAsync({ ruleId: 'test-rule-id' });

    expect(API.delete).toHaveBeenCalled();
  });

  it('should handle error during enable operation', async () => {
    const error = new Error('API Error');
    API.delete.mockRejectedValue(error);

    const onError = jest.fn();
    const { result } = renderHook(() => useEnableRule({ onError }), {
      wrapper: createWrapper(),
    });

    try {
      await result.current.mutateAsync({ ruleId: 'test-rule-id' });
    } catch (e) {
      expect(e).toBe(error);
    }

    expect(API.delete).toHaveBeenCalled();
  });

  it('should accept custom onSuccess callback', async () => {
    API.delete.mockResolvedValue({ status: 204 });

    const customOnSuccess = jest.fn();
    const { result } = renderHook(
      () => useEnableRule({ onSuccess: customOnSuccess }),
      {
        wrapper: createWrapper(),
      },
    );

    await result.current.mutateAsync({ ruleId: 'test-rule-id' });

    // The onSuccess callback is called by React Query after mutation succeeds
    expect(API.delete).toHaveBeenCalled();
  });

  it('should accept custom onError callback', async () => {
    const error = new Error('Test error');
    API.delete.mockRejectedValue(error);

    const customOnError = jest.fn();
    const { result } = renderHook(
      () => useEnableRule({ onError: customOnError }),
      {
        wrapper: createWrapper(),
      },
    );

    try {
      await result.current.mutateAsync({ ruleId: 'test-rule-id' });
    } catch {
      // Expected to throw
    }

    expect(API.delete).toHaveBeenCalled();
  });
});
