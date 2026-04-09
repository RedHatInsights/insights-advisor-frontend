import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import {
  Recs,
  useGetRecsQuery,
  useGetRecQuery,
  useGetRecSystemsQuery,
  useGetRecsBatchedQuery,
  useGetRecSystemsBatchedQuery,
} from './Recs';

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
      [Recs.reducerPath]: Recs.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(Recs.middleware),
  });

  // eslint-disable-next-line react/prop-types
  const Wrapper = ({ children }) => (
    <Provider store={store}>{children}</Provider>
  );
  return Wrapper;
};

describe('Recs Service', () => {
  beforeEach(() => {
    instance.mockImplementation(() => Promise.resolve({ data: [] }));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('useGetRecsQuery', () => {
    it('should fetch recommendations list', async () => {
      const mockData = {
        results: [
          { rule_id: 'rule1', description: 'Test rule 1' },
          { rule_id: 'rule2', description: 'Test rule 2' },
        ],
      };
      instance.mockResolvedValue(mockData);

      const { result } = renderHook(() => useGetRecsQuery({ limit: 10 }), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(instance).toHaveBeenCalledWith(
        expect.objectContaining({
          url: expect.stringContaining('/rule/'),
          method: 'get',
        }),
      );
      expect(result.current.data).toEqual(mockData);
    });

    it('should handle custom base path', async () => {
      const mockData = { results: [] };
      instance.mockResolvedValue(mockData);

      const { result } = renderHook(
        () =>
          useGetRecsQuery({
            limit: 10,
            customBasePath: 'https://custom.api.com',
          }),
        {
          wrapper: createWrapper(),
        },
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(instance).toHaveBeenCalledWith(
        expect.objectContaining({
          url: expect.stringContaining('https://custom.api.com/rule/'),
        }),
      );
    });

    it('should handle error response', async () => {
      const error = {
        response: {
          status: 500,
          data: { message: 'Internal server error' },
        },
      };
      instance.mockRejectedValue(error);

      const { result } = renderHook(() => useGetRecsQuery({ limit: 10 }), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error).toEqual({
        status: 500,
        data: { message: 'Internal server error' },
      });
    });
  });

  describe('useGetRecQuery', () => {
    it('should fetch a single recommendation by ID', async () => {
      const mockData = {
        rule_id: 'test-rule',
        description: 'Test rule description',
      };
      instance.mockResolvedValue(mockData);

      const { result } = renderHook(
        () => useGetRecQuery({ ruleId: 'test-rule' }),
        {
          wrapper: createWrapper(),
        },
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(instance).toHaveBeenCalledWith(
        expect.objectContaining({
          url: expect.stringContaining('/rule/test-rule/'),
          method: 'get',
        }),
      );
      expect(result.current.data).toEqual(mockData);
    });

    it('should encode special characters in rule ID', async () => {
      const mockData = { rule_id: 'test/rule' };
      instance.mockResolvedValue(mockData);

      const { result } = renderHook(
        () => useGetRecQuery({ ruleId: 'test/rule' }),
        {
          wrapper: createWrapper(),
        },
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(instance).toHaveBeenCalledWith(
        expect.objectContaining({
          url: expect.stringContaining('test%2Frule'),
        }),
      );
    });
  });

  describe('useGetRecSystemsQuery', () => {
    it('should fetch systems affected by a rule', async () => {
      const mockData = {
        results: [
          { system_uuid: 'system1', display_name: 'System 1' },
          { system_uuid: 'system2', display_name: 'System 2' },
        ],
      };
      instance.mockResolvedValue(mockData);

      const { result } = renderHook(
        () => useGetRecSystemsQuery({ ruleId: 'test-rule', limit: 20 }),
        {
          wrapper: createWrapper(),
        },
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(instance).toHaveBeenCalledWith(
        expect.objectContaining({
          url: expect.stringContaining('/rule/test-rule/systems/'),
          method: 'get',
        }),
      );
      expect(result.current.data).toEqual(mockData);
    });
  });

  describe('useGetRecsBatchedQuery', () => {
    it('should fetch recommendations with batching', async () => {
      instance
        .mockResolvedValueOnce({
          data: [{ rule_id: 'rule1' }, { rule_id: 'rule2' }],
          meta: { count: 5, offset: 0, limit: 2 },
        })
        .mockResolvedValueOnce({
          data: [{ rule_id: 'rule3' }, { rule_id: 'rule4' }],
          meta: { count: 5, offset: 2, limit: 2 },
        })
        .mockResolvedValueOnce({
          data: [{ rule_id: 'rule5' }],
          meta: { count: 5, offset: 4, limit: 2 },
        });

      const { result } = renderHook(
        () =>
          useGetRecsBatchedQuery({
            batch: true,
            batchSize: 2,
            autoBatch: false,
          }),
        { wrapper: createWrapper() },
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(instance).toHaveBeenCalledTimes(3);
      expect(result.current.data.data).toHaveLength(5);
      expect(result.current.data.meta.count).toBe(5);
    });

    it('should skip batching for small datasets', async () => {
      instance.mockResolvedValueOnce({
        data: [{ rule_id: 'rule1' }],
        meta: { count: 1, offset: 0, limit: 50 },
      });

      const { result } = renderHook(
        () =>
          useGetRecsBatchedQuery({
            batch: true,
            batchSize: 50,
          }),
        { wrapper: createWrapper() },
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(instance).toHaveBeenCalledTimes(1);
      expect(result.current.data.data).toHaveLength(1);
    });
  });

  describe('useGetRecSystemsBatchedQuery', () => {
    it('should fetch rule systems with batching', async () => {
      const ruleId = 'test-rule';

      instance
        .mockResolvedValueOnce({
          data: [{ system_uuid: 'sys1' }, { system_uuid: 'sys2' }],
          meta: { count: 4, offset: 0, limit: 2 },
        })
        .mockResolvedValueOnce({
          data: [{ system_uuid: 'sys3' }, { system_uuid: 'sys4' }],
          meta: { count: 4, offset: 2, limit: 2 },
        });

      const { result } = renderHook(
        () =>
          useGetRecSystemsBatchedQuery({
            batch: true,
            ruleId,
            batchSize: 2,
            autoBatch: false,
          }),
        { wrapper: createWrapper() },
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(instance).toHaveBeenCalledTimes(2);
      expect(result.current.data.data).toHaveLength(4);
    });
  });
});
