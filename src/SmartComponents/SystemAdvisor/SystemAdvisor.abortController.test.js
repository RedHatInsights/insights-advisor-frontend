/**
 * AbortController Signal Propagation Tests
 *
 * These unit tests validate that the signal parameter is properly
 * passed through to fetch calls in helper functions.
 *
 * Integration tests (Cypress) cover the full component behavior.
 */

import { fetchResolutionsData, isAbortError } from './helpers';
import * as helperModule from '../../PresentationalComponents/helper';

// Mock dependencies
jest.mock('../../PresentationalComponents/helper');

global.fetch = jest.fn();

describe('isAbortError', () => {
  test('returns true for AbortError', () => {
    const error = new Error('The user aborted a request.');
    error.name = 'AbortError';
    expect(isAbortError(error)).toBe(true);
  });

  test('returns true for CanceledError', () => {
    const error = new Error('Request cancelled');
    error.name = 'CanceledError';
    expect(isAbortError(error)).toBe(true);
  });

  test('returns false for regular Error', () => {
    const error = new Error('Network error');
    expect(isAbortError(error)).toBe(false);
  });

  test('returns false for null/undefined', () => {
    expect(isAbortError(null)).toBe(false);
    expect(isAbortError(undefined)).toBe(false);
  });
});

describe('fetchResolutionsData - Signal Propagation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    helperModule.getCsrfTokenHeader.mockReturnValue({ 'X-CSRF-Token': 'test' });
  });

  test('passes signal to fetch call', async () => {
    const mockSignal = new AbortController().signal;
    const selectedRules = [
      {
        rule: {
          rule_id: 'test-rule-1',
          description: 'Test',
          reboot_required: false,
        },
      },
    ];

    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        'advisor:test-rule-1': {
          resolutions: [{ id: 'fix-1', description: 'Fix 1' }],
        },
      }),
    });

    await fetchResolutionsData(
      selectedRules,
      'host-123',
      'Test Host',
      mockSignal,
    );

    expect(global.fetch).toHaveBeenCalledWith(
      '/insights_cloud/api/remediations/v1/resolutions',
      expect.objectContaining({
        signal: mockSignal,
      }),
    );
  });

  test('re-throws AbortError', async () => {
    const mockSignal = new AbortController().signal;
    const abortError = new Error('The user aborted a request.');
    abortError.name = 'AbortError';

    global.fetch.mockRejectedValue(abortError);

    await expect(
      fetchResolutionsData([], 'host-123', 'Test Host', mockSignal),
    ).rejects.toThrow('The user aborted a request.');
  });

  test('re-throws CanceledError', async () => {
    const mockSignal = new AbortController().signal;
    const cancelError = new Error('Request cancelled');
    cancelError.name = 'CanceledError';

    global.fetch.mockRejectedValue(cancelError);

    await expect(
      fetchResolutionsData([], 'host-123', 'Test Host', mockSignal),
    ).rejects.toThrow('Request cancelled');
  });

  test('returns empty array for other errors', async () => {
    const mockSignal = new AbortController().signal;
    const networkError = new Error('Network error');

    global.fetch.mockRejectedValue(networkError);

    const result = await fetchResolutionsData(
      [],
      'host-123',
      'Test Host',
      mockSignal,
    );

    expect(result).toEqual([]);
  });
});
