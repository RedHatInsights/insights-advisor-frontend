import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { Systems, useGetSystemsBatchedQuery } from './Systems';

jest.mock(
  '@redhat-cloud-services/frontend-components-utilities/interceptors',
  () => jest.fn(),
);

const instance = require('@redhat-cloud-services/frontend-components-utilities/interceptors');

jest.mock('p-all', () => {
  return jest.fn((tasks) => {
    return Promise.all(tasks.map((task) => task()));
  });
});

const createWrapper = () => {
  const store = configureStore({
    reducer: {
      [Systems.reducerPath]: Systems.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(Systems.middleware),
  });

  // eslint-disable-next-line react/prop-types
  const Wrapper = ({ children }) => (
    <Provider store={store}>{children}</Provider>
  );
  return Wrapper;
};

describe('Systems Service', () => {
  beforeEach(() => {
    instance.mockImplementation(() => Promise.resolve({ data: [] }));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('useGetSystemsBatchedQuery', () => {
    it('should fetch systems with batching', async () => {
      instance
        .mockResolvedValueOnce({
          data: [{ id: 'sys1' }, { id: 'sys2' }],
          meta: { count: 4, offset: 0, limit: 2 },
        })
        .mockResolvedValueOnce({
          data: [{ id: 'sys3' }, { id: 'sys4' }],
          meta: { count: 4, offset: 2, limit: 2 },
        });

      const { result } = renderHook(
        () =>
          useGetSystemsBatchedQuery({
            batch: true,
            batchSize: 2,
            autoBatch: false,
          }),
        { wrapper: createWrapper() },
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(instance).toHaveBeenCalledTimes(2);
      expect(result.current.data.data).toHaveLength(4);
      expect(result.current.data.meta.count).toBe(4);
    });

    it('should use endpoint-specific batch size defaults', async () => {
      instance.mockResolvedValueOnce({
        data: [{ id: 'sys1' }],
        meta: { count: 1, offset: 0, limit: 100 },
      });

      const { result } = renderHook(
        () =>
          useGetSystemsBatchedQuery({
            batch: true,
          }),
        { wrapper: createWrapper() },
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(instance).toHaveBeenCalledWith(
        expect.objectContaining({
          params: expect.objectContaining({
            limit: 100,
          }),
        }),
      );
    });

    it('should preserve query parameters across batches', async () => {
      instance
        .mockResolvedValueOnce({
          data: [{ id: 'sys1' }],
          meta: { count: 2, offset: 0, limit: 1 },
        })
        .mockResolvedValueOnce({
          data: [{ id: 'sys2' }],
          meta: { count: 2, offset: 1, limit: 1 },
        });

      const { result } = renderHook(
        () =>
          useGetSystemsBatchedQuery({
            batch: true,
            batchSize: 1,
            filter: 'os=RHEL',
            sort: 'display_name',
            autoBatch: false,
          }),
        { wrapper: createWrapper() },
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(instance).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({
          params: expect.objectContaining({
            filter: 'os=RHEL',
            sort: 'display_name',
            offset: 0,
            limit: 1,
          }),
        }),
      );

      expect(instance).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({
          params: expect.objectContaining({
            filter: 'os=RHEL',
            sort: 'display_name',
            offset: 1,
            limit: 1,
          }),
        }),
      );
    });
  });
});
