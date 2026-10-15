import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import useOverviewData from './useOverviewData';
import { dataFetch } from '../../../../Services/Overview';

jest.mock('../../../../Services/Overview', () => ({
  dataFetch: jest.fn(),
}));

jest.mock(
  '@redhat-cloud-services/frontend-components-utilities/interceptors',
  () => ({
    useAxiosWithPlatformInterceptors: jest.fn(() => ({
      get: jest.fn(),
    })),
  }),
);

const mockStore = configureStore([]);

describe('useOverviewData hook', () => {
  const mockEnvContext = {
    STATS_OVERVIEW_FETCH_URL: '/api/insights/v1/stats/overview/',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    dataFetch.mockResolvedValue({
      total_risk: 10,
      pathways: 5,
      loaded: true,
      isError: false,
    });
  });

  const createWrapper = (filtersState = {}) => {
    const store = mockStore({
      filters: {
        selectedTags: [],
        selectedGroups: [],
        workloads: {},
        ...filtersState,
      },
    });
    // eslint-disable-next-line react/prop-types
    const Wrapper = ({ children }) => (
      <Provider store={store}>{children}</Provider>
    );
    Wrapper.displayName = 'MockStoreWrapper';
    return Wrapper;
  };

  it('fetches overview data on mount with empty options when no filters are set', async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useOverviewData(mockEnvContext), {
      wrapper,
    });

    await waitFor(() => {
      expect(result.current.data.loaded).toBe(true);
    });

    expect(dataFetch).toHaveBeenCalledWith(
      mockEnvContext,
      expect.anything(),
      {},
    );
  });

  it('passes selectedTags to dataFetch when present in Redux', async () => {
    const wrapper = createWrapper({
      selectedTags: ['env=prod', 'tier=frontend'],
    });
    const { result } = renderHook(() => useOverviewData(mockEnvContext), {
      wrapper,
    });

    await waitFor(() => {
      expect(result.current.data.loaded).toBe(true);
    });

    expect(dataFetch).toHaveBeenCalledWith(
      mockEnvContext,
      expect.anything(),
      expect.objectContaining({
        tags: 'env=prod,tier=frontend',
      }),
    );
  });

  it('passes selectedGroups to dataFetch when present in Redux', async () => {
    const wrapper = createWrapper({
      selectedGroups: ['production', 'staging'],
    });
    const { result } = renderHook(() => useOverviewData(mockEnvContext), {
      wrapper,
    });

    await waitFor(() => {
      expect(result.current.data.loaded).toBe(true);
    });

    expect(dataFetch).toHaveBeenCalledWith(
      mockEnvContext,
      expect.anything(),
      expect.objectContaining({
        groups: 'production,staging',
      }),
    );
  });

  it('handles selectedGroups as a single string', async () => {
    const wrapper = createWrapper({
      selectedGroups: 'single-workspace',
    });
    const { result } = renderHook(() => useOverviewData(mockEnvContext), {
      wrapper,
    });

    await waitFor(() => {
      expect(result.current.data.loaded).toBe(true);
    });

    expect(dataFetch).toHaveBeenCalledWith(
      mockEnvContext,
      expect.anything(),
      expect.objectContaining({
        groups: 'single-workspace',
      }),
    );
  });

  it('provides refetch function that triggers dataFetch again', async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useOverviewData(mockEnvContext), {
      wrapper,
    });

    await waitFor(() => {
      expect(result.current.data.loaded).toBe(true);
    });

    dataFetch.mockClear();

    await result.current.refetch();

    expect(dataFetch).toHaveBeenCalledTimes(1);
  });
});
