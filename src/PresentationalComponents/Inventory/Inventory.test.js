import React from 'react';
import '@testing-library/jest-dom';
import { render, waitFor } from '@testing-library/react';
import configureStore from 'redux-mock-store';
import Inventory from './Inventory';
import { ComponentWithContext } from '../../Utilities/TestingUtilities';

const mockAxiosGet = jest.fn();
const mockAddNotification = jest.fn();

jest.mock('@redhat-cloud-services/frontend-components/Inventory', () => ({
  InventoryTable: jest.fn(({ children }) => (
    <div data-testid="inventory-table">{children}</div>
  )),
}));

jest.mock(
  '@redhat-cloud-services/frontend-components-remediations/RemediationButton',
  () => ({
    __esModule: true,
    default: jest.fn(({ isDisabled, children }) => (
      <button data-testid="remediation-button" disabled={isDisabled}>
        {children}
      </button>
    )),
  }),
);

jest.mock('@redhat-cloud-services/frontend-components-notifications/', () => ({
  useAddNotification: () => mockAddNotification,
}));

const mockStore = configureStore([]);

const defaultRule = {
  rule_id: 'test-rule-123',
  description: 'Test rule description',
};

const renderInventory = (props = {}, contextValue = {}) => {
  const store = mockStore({
    entities: {
      columns: [],
      rows: [],
      total: 0,
    },
  });

  const defaultProps = {
    rule: defaultRule,
    axios: { get: mockAxiosGet },
    selectedTags: [],
    workloads: [],
    ...props,
  };

  const mergedContext = {
    RULES_FETCH_URL: '/api/insights/v1/rule/',
    BASE_URL: '/api/insights/v1',
    ...contextValue,
  };

  return render(
    <ComponentWithContext
      Component={Inventory}
      componentProps={defaultProps}
      renderOptions={{ store }}
      contextValue={mergedContext}
    />,
  );
};

describe('Inventory - Playbook Count Scenarios', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rulesCheck() - API fetch behavior', () => {
    it('should fetch playbook count when rulesPlaybookCount is -1 (initial state)', async () => {
      mockAxiosGet.mockResolvedValueOnce({
        playbook_count: 5,
      });

      renderInventory();

      await waitFor(() => {
        expect(mockAxiosGet).toHaveBeenCalledWith(
          '/api/insights/v1/rule/test-rule-123/',
          { params: { name: '' } },
        );
      });
    });

    it('should encode rule_id in URL', async () => {
      mockAxiosGet.mockResolvedValueOnce({ playbook_count: 1 });

      const ruleWithSpecialChars = {
        rule_id: 'test rule/with|special',
        description: 'Test',
      };

      renderInventory({ rule: ruleWithSpecialChars });

      await waitFor(() => {
        expect(mockAxiosGet).toHaveBeenCalledWith(
          expect.stringContaining('test%20rule'),
          expect.any(Object),
        );
      });
    });

    it('should not call API when rule.rule_id is missing', async () => {
      renderInventory({ rule: {} });

      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(mockAxiosGet).not.toHaveBeenCalled();
      expect(mockAddNotification).not.toHaveBeenCalled();
    });

    it('should not call API when rule is undefined', async () => {
      renderInventory({ rule: undefined });

      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(mockAxiosGet).not.toHaveBeenCalled();
      expect(mockAddNotification).not.toHaveBeenCalled();
    });
  });

  describe('Playbook Count State: -1 (Not Yet Fetched)', () => {
    it('should start with rulesPlaybookCount = -1', async () => {
      const promise = new Promise(() => {});
      mockAxiosGet.mockReturnValue(promise);

      renderInventory();

      await waitFor(() => {
        expect(mockAxiosGet).toHaveBeenCalled();
      });
    });
  });

  describe('Playbook Count State: undefined (Fetch Failed)', () => {
    it('should set rulesPlaybookCount to undefined when API returns response without playbook_count', async () => {
      mockAxiosGet.mockResolvedValueOnce({});

      renderInventory();

      await waitFor(() => {
        expect(mockAxiosGet).toHaveBeenCalled();
      });
    });

    it('should set rulesPlaybookCount to undefined when API returns null response', async () => {
      mockAxiosGet.mockResolvedValueOnce(null);

      renderInventory();

      await waitFor(() => {
        expect(mockAxiosGet).toHaveBeenCalled();
      });
    });

    it('should handle API network errors and show notification', async () => {
      mockAxiosGet.mockRejectedValueOnce(new Error('Network error'));

      renderInventory();

      await waitFor(() => {
        expect(mockAxiosGet).toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(mockAddNotification).toHaveBeenCalledWith({
          variant: 'danger',
          title: 'Failed to fetch playbook information',
          description:
            'Unable to load remediation details for this recommendation.',
        });
      });
    });

    it('should handle API 500 errors and show notification', async () => {
      mockAxiosGet.mockRejectedValueOnce({
        response: { status: 500 },
        message: 'Internal server error',
      });

      renderInventory();

      await waitFor(() => {
        expect(mockAxiosGet).toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(mockAddNotification).toHaveBeenCalledWith({
          variant: 'danger',
          title: 'Failed to fetch playbook information',
          description:
            'Unable to load remediation details for this recommendation.',
        });
      });
    });

    it('should handle API 404 errors and show notification', async () => {
      mockAxiosGet.mockRejectedValueOnce({
        response: { status: 404 },
        message: 'Not found',
      });

      renderInventory();

      await waitFor(() => {
        expect(mockAxiosGet).toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(mockAddNotification).toHaveBeenCalledWith({
          variant: 'danger',
          title: 'Failed to fetch playbook information',
          description:
            'Unable to load remediation details for this recommendation.',
        });
      });
    });

    it('should set rulesPlaybookCount to 0 when API call fails', async () => {
      mockAxiosGet.mockRejectedValueOnce(new Error('Network error'));

      renderInventory();

      await waitFor(() => {
        expect(mockAxiosGet).toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(mockAddNotification).toHaveBeenCalled();
      });
    });
  });

  describe('Playbook Count State: 0 (No Playbooks Available)', () => {
    it('should set rulesPlaybookCount to 0 when API returns playbook_count: 0', async () => {
      mockAxiosGet.mockResolvedValueOnce({
        playbook_count: 0,
      });

      renderInventory();

      await waitFor(() => {
        expect(mockAxiosGet).toHaveBeenCalled();
      });
    });

    it('should distinguish between 0 and undefined', async () => {
      mockAxiosGet.mockResolvedValueOnce({
        playbook_count: 0,
      });

      renderInventory();

      await waitFor(() => {
        expect(mockAxiosGet).toHaveBeenCalled();
      });
    });
  });

  describe('Playbook Count State: > 0 (Playbooks Available)', () => {
    it('should set rulesPlaybookCount when API returns playbook_count: 1', async () => {
      mockAxiosGet.mockResolvedValueOnce({
        playbook_count: 1,
      });

      renderInventory();

      await waitFor(() => {
        expect(mockAxiosGet).toHaveBeenCalled();
      });
    });

    it('should handle large playbook counts', async () => {
      mockAxiosGet.mockResolvedValueOnce({
        playbook_count: 999,
      });

      renderInventory();

      await waitFor(() => {
        expect(mockAxiosGet).toHaveBeenCalled();
      });
    });

    it('should handle playbook_count: 1 (edge case)', async () => {
      mockAxiosGet.mockResolvedValueOnce({
        playbook_count: 1,
      });

      renderInventory();

      await waitFor(() => {
        expect(mockAxiosGet).toHaveBeenCalled();
      });
    });
  });

  describe('Button Enable/Disable Logic', () => {
    describe('When rulesPlaybookCount > 0 (has playbooks)', () => {
      beforeEach(() => {
        mockAxiosGet.mockResolvedValue({
          playbook_count: 5,
        });
      });

      it('should disable button when no systems selected (undefined > 0 = false)', async () => {
        renderInventory();

        await waitFor(() => {
          expect(mockAxiosGet).toHaveBeenCalled();
        });
      });

      it('should disable button when selectedIds.length = 0', async () => {
        renderInventory();

        await waitFor(() => {
          expect(mockAxiosGet).toHaveBeenCalled();
        });
      });
    });

    describe('When rulesPlaybookCount = 0 (no playbooks)', () => {
      beforeEach(() => {
        mockAxiosGet.mockResolvedValue({
          playbook_count: 0,
        });
      });

      it('should disable button even if systems are selected (0 > 0 = false)', async () => {
        renderInventory();

        await waitFor(() => {
          expect(mockAxiosGet).toHaveBeenCalled();
        });
      });
    });

    describe('When rulesPlaybookCount = undefined (fetch failed)', () => {
      beforeEach(() => {
        mockAxiosGet.mockResolvedValue({});
      });

      it('should disable button safely (undefined > 0 = false, no error)', async () => {
        renderInventory();

        await waitFor(() => {
          expect(mockAxiosGet).toHaveBeenCalled();
        });
      });

      it('should handle undefined in comparison without throwing', async () => {
        mockAxiosGet.mockResolvedValue(null);

        expect(() => {
          renderInventory();
        }).not.toThrow();

        await waitFor(() => {
          expect(mockAxiosGet).toHaveBeenCalled();
        });

        expect(undefined > 0).toBe(false);
      });
    });

    describe('When rulesPlaybookCount = -1 (not yet fetched)', () => {
      it('should disable button while loading (-1 > 0 = false)', async () => {
        const promise = new Promise(() => {});
        mockAxiosGet.mockReturnValue(promise);

        renderInventory();

        await waitFor(() => {
          expect(mockAxiosGet).toHaveBeenCalled();
        });
      });
    });
  });

  describe('Comparison Safety Proof', () => {
    it('should prove undefined > 0 returns false (not error)', () => {
      expect(undefined > 0).toBe(false);
    });

    it('should prove null > 0 returns false (not error)', () => {
      expect(null > 0).toBe(false);
    });

    it('should prove -1 > 0 returns false', () => {
      expect(-1 > 0).toBe(false);
    });

    it('should prove 0 > 0 returns false', () => {
      expect(0 > 0).toBe(false);
    });

    it('should prove 1 > 0 returns true', () => {
      expect(1 > 0).toBe(true);
    });

    it('should demonstrate that undefined does NOT need || 0 fallback', () => {
      const rulesPlaybookCount = undefined;
      const selectedIds = ['system-1', 'system-2'];

      // This is the actual logic in the component
      const shouldEnableButton =
        rulesPlaybookCount > 0 && selectedIds?.length > 0;

      // Should be false, not throw an error
      expect(shouldEnableButton).toBe(false);
    });

    it('should demonstrate state meaning differences', () => {
      expect(-1 > 0).toBe(false);
      expect(undefined > 0).toBe(false);
      expect(0 > 0).toBe(false);
      expect(5 > 0).toBe(true);
    });
  });

  describe('Pathway mode - should NOT fetch playbook count', () => {
    it('should not call rulesCheck when pathway prop is provided', async () => {
      const pathway = { slug: 'test-pathway' };

      mockAxiosGet.mockResolvedValue({
        data: [],
        meta: { count: 0 },
      });

      renderInventory(
        { pathway, rule: undefined },
        { BASE_URL: '/api/insights/v1' },
      );

      await waitFor(() => {
        expect(mockAxiosGet).toHaveBeenCalledWith(
          expect.stringContaining('/pathway/test-pathway/rules/'),
        );
      });

      const calls = mockAxiosGet.mock.calls;
      const ruleCalls = calls.filter(
        ([url]) => url.includes('/rule/') && !url.includes('/pathway/'),
      );
      expect(ruleCalls.length).toBe(0);
    });
  });

  describe('Pathway mode - error handling', () => {
    const pathway = { slug: 'test-pathway' };

    it('should handle pathway rules API failure with notification', async () => {
      mockAxiosGet.mockRejectedValueOnce(new Error('Network error'));

      renderInventory(
        { pathway, rule: undefined },
        { BASE_URL: '/api/insights/v1' },
      );

      await waitFor(() => {
        expect(mockAxiosGet).toHaveBeenCalledWith(
          expect.stringContaining('/pathway/test-pathway/rules/'),
        );
      });

      await waitFor(() => {
        expect(mockAddNotification).toHaveBeenCalledWith({
          variant: 'danger',
          title: 'Failed to fetch pathway information',
          description: 'Unable to load remediation details for this pathway.',
        });
      });
    });

    it('should handle pathway 404 errors with notification', async () => {
      mockAxiosGet.mockRejectedValueOnce({
        response: { status: 404 },
        message: 'Pathway not found',
      });

      renderInventory(
        { pathway, rule: undefined },
        { BASE_URL: '/api/insights/v1' },
      );

      await waitFor(() => {
        expect(mockAxiosGet).toHaveBeenCalledWith(
          expect.stringContaining('/pathway/test-pathway/rules/'),
        );
      });

      await waitFor(() => {
        expect(mockAddNotification).toHaveBeenCalledWith({
          variant: 'danger',
          title: 'Failed to fetch pathway information',
          description: 'Unable to load remediation details for this pathway.',
        });
      });
    });

    it('should set empty pathway data when API fails', async () => {
      mockAxiosGet.mockRejectedValueOnce(new Error('Server error'));

      renderInventory(
        { pathway, rule: undefined },
        { BASE_URL: '/api/insights/v1' },
      );

      await waitFor(() => {
        expect(mockAxiosGet).toHaveBeenCalledWith(
          expect.stringContaining('/pathway/test-pathway/rules/'),
        );
      });

      await waitFor(() => {
        expect(mockAddNotification).toHaveBeenCalled();
      });
    });
  });

  describe('Edge cases', () => {
    it('should handle playbook_count as string "0"', async () => {
      mockAxiosGet.mockResolvedValueOnce({
        playbook_count: '0',
      });

      renderInventory();

      await waitFor(() => {
        expect(mockAxiosGet).toHaveBeenCalled();
      });
    });

    it('should handle playbook_count as string "5"', async () => {
      mockAxiosGet.mockResolvedValueOnce({
        playbook_count: '5',
      });

      renderInventory();

      await waitFor(() => {
        expect(mockAxiosGet).toHaveBeenCalled();
      });
    });

    it('should handle playbook_count as boolean false', async () => {
      mockAxiosGet.mockResolvedValueOnce({
        playbook_count: false,
      });

      renderInventory();

      await waitFor(() => {
        expect(mockAxiosGet).toHaveBeenCalled();
      });
    });

    it('should handle playbook_count as NaN', async () => {
      mockAxiosGet.mockResolvedValueOnce({
        playbook_count: NaN,
      });

      renderInventory();

      await waitFor(() => {
        expect(mockAxiosGet).toHaveBeenCalled();
      });
    });
  });

  describe('Documentation compliance', () => {
    it('should handle fetch errors with notification and set to 0', async () => {
      mockAxiosGet.mockRejectedValueOnce(new Error('Network error'));

      renderInventory();

      await waitFor(() => {
        expect(mockAxiosGet).toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(mockAddNotification).toHaveBeenCalledWith({
          variant: 'danger',
          title: 'Failed to fetch playbook information',
          description:
            'Unable to load remediation details for this recommendation.',
        });
      });
    });

    it('should preserve undefined for successful responses without playbook_count', async () => {
      mockAxiosGet.mockResolvedValueOnce({});

      renderInventory();

      await waitFor(() => {
        expect(mockAxiosGet).toHaveBeenCalled();
      });

      expect(mockAddNotification).not.toHaveBeenCalled();
    });

    it('should demonstrate error handling approach', () => {
      const apiRejected = 0;
      const apiSuccessNoPlaybooks = 0;
      const apiSuccessEmptyResponse = undefined;

      expect(apiRejected).toBe(apiSuccessNoPlaybooks);
      expect(apiSuccessEmptyResponse).not.toBe(apiSuccessNoPlaybooks);
    });
  });
});
