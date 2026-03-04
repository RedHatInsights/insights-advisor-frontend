import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import {
  Acks,
  useGetRecAcksQuery,
  useGetHostAcksQuery,
  useSetAckMutation,
} from './Acks';

jest.mock(
  '@redhat-cloud-services/frontend-components-utilities/interceptors',
  () => jest.fn(),
);

const instance = require('@redhat-cloud-services/frontend-components-utilities/interceptors');

const createWrapper = () => {
  const store = configureStore({
    reducer: {
      [Acks.reducerPath]: Acks.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(Acks.middleware),
  });

  // eslint-disable-next-line react/prop-types
  const Wrapper = ({ children }) => (
    <Provider store={store}>{children}</Provider>
  );
  return Wrapper;
};

describe('Acks Service', () => {
  beforeEach(() => {
    instance.mockImplementation(() => Promise.resolve({ data: {} }));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('useGetRecAcksQuery', () => {
    it('should fetch acknowledgments for a rule', async () => {
      const mockData = {
        justification: 'Test justification',
        created_by: 'user@example.com',
      };
      instance.mockResolvedValue(mockData);

      const { result } = renderHook(
        () => useGetRecAcksQuery({ ruleId: 'test-rule' }),
        {
          wrapper: createWrapper(),
        },
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(instance).toHaveBeenCalledWith(
        expect.objectContaining({
          url: expect.stringContaining('/ack/test-rule/'),
          method: 'get',
        }),
      );
      expect(result.current.data).toEqual(mockData);
    });

    it('should handle custom base path', async () => {
      const mockData = { justification: 'Test' };
      instance.mockResolvedValue(mockData);

      const { result } = renderHook(
        () =>
          useGetRecAcksQuery({
            ruleId: 'test-rule',
            customBasePath: 'https://custom.api.com',
          }),
        {
          wrapper: createWrapper(),
        },
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(instance).toHaveBeenCalledWith(
        expect.objectContaining({
          url: expect.stringContaining('https://custom.api.com/ack/test-rule/'),
        }),
      );
    });

    it('should encode special characters in rule ID', async () => {
      const mockData = { justification: 'Test' };
      instance.mockResolvedValue(mockData);

      const { result } = renderHook(
        () => useGetRecAcksQuery({ ruleId: 'test/rule' }),
        {
          wrapper: createWrapper(),
        },
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(instance).toHaveBeenCalledWith(
        expect.objectContaining({
          url: expect.stringContaining('/ack/test'),
        }),
      );
    });
  });

  describe('useGetHostAcksQuery', () => {
    it('should fetch host acknowledgments', async () => {
      const mockData = {
        data: [
          { id: '1', justification: 'Host ack 1' },
          { id: '2', justification: 'Host ack 2' },
        ],
      };
      instance.mockResolvedValue(mockData);

      const { result } = renderHook(() => useGetHostAcksQuery({ limit: 10 }), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(instance).toHaveBeenCalledWith(
        expect.objectContaining({
          url: expect.stringContaining('/hostack/'),
          method: 'get',
        }),
      );
      expect(result.current.data).toEqual(mockData.data);
    });

    it('should handle custom base path', async () => {
      const mockData = { data: [] };
      instance.mockResolvedValue(mockData);

      const { result } = renderHook(
        () =>
          useGetHostAcksQuery({
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
          url: expect.stringContaining('https://custom.api.com/hostack/'),
        }),
      );
    });
  });

  describe('useSetAckMutation', () => {
    it('should create a rule acknowledgment', async () => {
      const mockData = { created: true };
      instance.mockResolvedValue(mockData);

      const { result } = renderHook(() => useSetAckMutation(), {
        wrapper: createWrapper(),
      });

      const [setAck] = result.current;

      await setAck({
        type: 'RULE',
        options: {
          rule_id: 'test-rule',
          justification: 'Test justification',
        },
      });

      await waitFor(() => expect(result.current[1].isSuccess).toBe(true));

      expect(instance).toHaveBeenCalledWith(
        expect.objectContaining({
          url: expect.stringContaining('/ack/'),
          method: 'post',
        }),
      );
    });

    it('should create a host acknowledgment', async () => {
      const mockData = { created: true };
      instance.mockResolvedValue(mockData);

      const { result } = renderHook(() => useSetAckMutation(), {
        wrapper: createWrapper(),
      });

      const [setAck] = result.current;

      await setAck({
        type: 'HOST',
        options: {
          host_id: 'host-123',
          justification: 'Test justification',
        },
      });

      await waitFor(() => expect(result.current[1].isSuccess).toBe(true));

      expect(instance).toHaveBeenCalledWith(
        expect.objectContaining({
          url: expect.stringContaining('/hostack/'),
          method: 'post',
        }),
      );
    });

    it('should include CSRF token in headers', async () => {
      const mockData = { created: true };
      instance.mockResolvedValue(mockData);

      const { result } = renderHook(() => useSetAckMutation(), {
        wrapper: createWrapper(),
      });

      const [setAck] = result.current;

      await setAck({
        type: 'RULE',
        options: { rule_id: 'test-rule' },
        csrfToken: 'test-csrf-token',
      });

      await waitFor(() => expect(result.current[1].isSuccess).toBe(true));

      expect(instance).toHaveBeenCalledWith(
        expect.objectContaining({
          headers: { 'X-CSRF-Token': 'test-csrf-token' },
        }),
      );
    });

    it('should handle custom base path', async () => {
      const mockData = { created: true };
      instance.mockResolvedValue(mockData);

      const { result } = renderHook(() => useSetAckMutation(), {
        wrapper: createWrapper(),
      });

      const [setAck] = result.current;

      await setAck({
        type: 'RULE',
        options: { rule_id: 'test-rule' },
        customBasePath: 'https://custom.api.com',
      });

      await waitFor(() => expect(result.current[1].isSuccess).toBe(true));

      expect(instance).toHaveBeenCalledWith(
        expect.objectContaining({
          url: expect.stringContaining('https://custom.api.com/ack/'),
        }),
      );
    });

    it('should handle mutation error', async () => {
      const error = {
        response: {
          status: 400,
          data: { message: 'Invalid justification' },
        },
      };
      instance.mockRejectedValue(error);

      const { result } = renderHook(() => useSetAckMutation(), {
        wrapper: createWrapper(),
      });

      const [setAck] = result.current;

      await setAck({
        type: 'RULE',
        options: { rule_id: 'test-rule' },
      });

      await waitFor(() => expect(result.current[1].isError).toBe(true));

      expect(result.current[1].error).toEqual({
        status: 400,
        data: { message: 'Invalid justification' },
      });
    });
  });
});
