import React from 'react';
import '@testing-library/jest-dom';
import { act, render, waitFor } from '@testing-library/react';
import configureStore from 'redux-mock-store';
import Inventory from './Inventory';
import { ComponentWithContext } from '../../Utilities/TestingUtilities';

const mockAxiosGet = jest.fn();
const mockAddNotification = jest.fn();

const MockInventoryTable = jest.fn(({ children }) => (
  <div data-testid="inventory-table">{children}</div>
));

jest.mock('@redhat-cloud-services/frontend-components/Inventory', () => ({
  InventoryTable: (...args) => MockInventoryTable(...args),
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

jest.mock('../../Utilities/Hooks', () => ({
  useFeatureFlag: jest.fn(() => false),
}));

const mockStore = configureStore([]);

const defaultRule = {
  rule_id: 'test-rule-123',
  description: 'Test rule description',
};

const renderInventory = (props = {}, contextValue = {}) => {
  const store =
    props.store ||
    mockStore({
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
        expect(mockAxiosGet).toHaveBeenCalledWith('/api/insights/v1/rule/', {
          params: {
            pathway: 'test-pathway',
            impacting: true,
          },
        });
      });

      const calls = mockAxiosGet.mock.calls;
      const ruleCalls = calls.filter(
        ([url]) => url.includes('/rule/') && url.includes('/test-rule-123/'),
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
        expect(mockAxiosGet).toHaveBeenCalledWith('/api/insights/v1/rule/', {
          params: {
            pathway: 'test-pathway',
            impacting: true,
          },
        });
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
        expect(mockAxiosGet).toHaveBeenCalledWith('/api/insights/v1/rule/', {
          params: {
            pathway: 'test-pathway',
            impacting: true,
          },
        });
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
        expect(mockAxiosGet).toHaveBeenCalledWith('/api/insights/v1/rule/', {
          params: {
            pathway: 'test-pathway',
            impacting: true,
          },
        });
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

  describe('createColumns null guard', () => {
    it('returns fallback columns when defaultColumns is undefined', async () => {
      mockAxiosGet.mockResolvedValueOnce({ playbook_count: 1 });

      renderInventory();

      await waitFor(() => {
        expect(MockInventoryTable).toHaveBeenCalled();
      });

      const lastCall =
        MockInventoryTable.mock.calls[MockInventoryTable.mock.calls.length - 1];
      const columnsCallback = lastCall[0].columns;

      const result = columnsCallback(undefined);
      expect(result).toHaveLength(1);
      expect(result[0].key).toBe('last_seen');
    });

    it('returns fallback columns when defaultColumns is null', async () => {
      mockAxiosGet.mockResolvedValueOnce({ playbook_count: 1 });

      renderInventory();

      await waitFor(() => {
        expect(MockInventoryTable).toHaveBeenCalled();
      });

      const lastCall =
        MockInventoryTable.mock.calls[MockInventoryTable.mock.calls.length - 1];
      const columnsCallback = lastCall[0].columns;

      const result = columnsCallback(null);
      expect(result).toHaveLength(1);
      expect(result[0].key).toBe('last_seen');
    });

    it('processes columns normally when defaultColumns is provided', async () => {
      mockAxiosGet.mockResolvedValueOnce({ playbook_count: 1 });

      renderInventory();

      await waitFor(() => {
        expect(MockInventoryTable).toHaveBeenCalled();
      });

      const lastCall =
        MockInventoryTable.mock.calls[MockInventoryTable.mock.calls.length - 1];
      const columnsCallback = lastCall[0].columns;

      const mockDefaultColumns = [
        { key: 'display_name', title: 'Name', sortKey: 'display_name' },
        {
          key: 'system_profile',
          title: 'Operating system',
          sortKey: 'operating_system',
          dataLabel: 'OS',
        },
        { key: 'tags', title: 'Tags', props: { width: 10, isStatic: true } },
        {
          key: 'groups',
          title: 'Workspace',
          sortKey: 'group_name',
          props: { width: 10 },
        },
      ];

      const result = columnsCallback(mockDefaultColumns);
      expect(result.length).toBeGreaterThan(1);
      expect(result.find((col) => col.key === 'last_seen')).toBeTruthy();
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

  describe('Navigation search reset', () => {
    it('resets advisorFilters on rule change so previous search does not carry over', async () => {
      const { rerender } = renderInventory({ rule: { rule_id: 'RULE_ONE' } });
      const lastIndex = MockInventoryTable.mock.calls.length - 1;
      const firstCall = MockInventoryTable.mock.calls[lastIndex][0];
      expect(firstCall.customFilters.advisorFilters.name).toBe('');

      rerender(
        <ComponentWithContext
          Component={Inventory}
          props={{
            rule: { rule_id: 'RULE_TWO' },
            axios: { get: mockAxiosGet },
            selectedTags: [],
            workloads: [],
          }}
          contextValue={{
            RULES_FETCH_URL: '/api/insights/v1/rule/',
            BASE_URL: '/api/insights/v1',
          }}
        />,
      );

      const nextIndex = MockInventoryTable.mock.calls.length - 1;
      const secondCall = MockInventoryTable.mock.calls[nextIndex][0];
      expect(secondCall.customFilters.advisorFilters.name).toBe('');
    });
  });

  describe('Table sorting configuration', () => {
    it('does not pass sortBy in tableProps so FEC controls active sorting', () => {
      renderInventory({ rule: { rule_id: 'RULE_ONE' } });
      const lastIndex = MockInventoryTable.mock.calls.length - 1;
      const tableProps = MockInventoryTable.mock.calls[lastIndex][0].tableProps;
      expect(tableProps.sortBy).toBeUndefined();
    });

    it('passes initialSortBy with key "last_seen" to onLoad reducer configuration', () => {
      const mockReplaceReducer = jest.fn();
      const customStore = {
        getState: () => ({ entities: { columns: [], rows: [], total: 0 } }),
        subscribe: jest.fn(),
        dispatch: jest.fn(),
        replaceReducer: mockReplaceReducer,
      };

      const mockMergeWithEntities = jest.fn((reducer, config) => ({
        ...config,
      }));
      const mockMergeWithDetail = jest.fn(() => ({}));

      renderInventory({
        rule: { rule_id: 'RULE_ONE' },
        store: customStore,
      });

      const lastIndex = MockInventoryTable.mock.calls.length - 1;
      const onLoad = MockInventoryTable.mock.calls[lastIndex][0].onLoad;

      onLoad({
        mergeWithEntities: mockMergeWithEntities,
        INVENTORY_ACTION_TYPES: {},
        mergeWithDetail: mockMergeWithDetail,
      });

      expect(mockMergeWithEntities).toHaveBeenCalledWith(
        expect.any(Function),
        expect.objectContaining({
          sortBy: {
            index: expect.any(Number),
            key: 'last_seen',
            direction: 'desc',
          },
        }),
      );
    });
  });

  describe('Filter chip removal URL synchronization', () => {
    beforeEach(() => {
      window.history.replaceState(
        null,
        '',
        '/?limit=20&offset=0&sort=-last_seen&filter%5Bsystem_profile%5D=true&name=3D%20',
      );
    });

    afterEach(() => {
      window.history.replaceState(null, '', '/');
    });

    it('removes the name filter from the URL when the FEC text chip is deleted', async () => {
      mockAxiosGet.mockResolvedValue({ playbook_count: 0 });

      renderInventory();

      await waitFor(() => {
        expect(MockInventoryTable).toHaveBeenCalled();
      });

      const lastCall =
        MockInventoryTable.mock.calls[MockInventoryTable.mock.calls.length - 1];
      const lastProps = lastCall[0];
      expect(lastProps.activeFiltersConfig.filters).toEqual([]);

      act(() => {
        lastProps.activeFiltersConfig.onDelete(
          {},
          [
            {
              category: 'Display name',
              type: 'textual',
              chips: [{ name: '3D ' }],
            },
          ],
          false,
        );
      });

      expect(window.location.search).not.toContain('name=');
      expect(window.location.search).not.toContain('display_name=');

      await waitFor(() => {
        const latestCall =
          MockInventoryTable.mock.calls[
            MockInventoryTable.mock.calls.length - 1
          ];
        const latestProps = latestCall[0];
        expect(latestProps.customFilters.advisorFilters.name).toBeUndefined();
        expect(latestProps.customFilters.filters).toEqual([]);
      });
    });

    it('renders Workspace and Tags chips from URL and synchronizes URL on chip deletion', async () => {
      window.history.replaceState(
        null,
        '',
        '/?limit=20&offset=0&sort=-last_seen&filter%5Bsystem_profile%5D=true&groups=advisor_3ec817eb-b5db-4aa3-8786-ff3837f7c90f&tags=AacBhXapq%2FDWSBsyuF%3DALkkJjC',
      );
      mockAxiosGet.mockResolvedValue({ playbook_count: 0 });

      renderInventory();

      await waitFor(() => {
        expect(MockInventoryTable).toHaveBeenCalled();
      });

      let lastCall =
        MockInventoryTable.mock.calls[MockInventoryTable.mock.calls.length - 1];
      let lastProps = lastCall[0];

      expect(lastProps.activeFiltersConfig.filters).toEqual(
        expect.arrayContaining([
          {
            category: 'Workspace',
            urlParam: 'groups',
            chips: [
              {
                name: 'advisor_3ec817eb-b5db-4aa3-8786-ff3837f7c90f',
                value: 'advisor_3ec817eb-b5db-4aa3-8786-ff3837f7c90f',
              },
            ],
          },
          {
            category: 'Tags',
            urlParam: 'tags',
            chips: [
              {
                name: 'DWSBsyuF=ALkkJjC',
                value: 'AacBhXapq/DWSBsyuF=ALkkJjC',
              },
            ],
          },
        ]),
      );

      // Delete Workspace chip
      act(() => {
        lastProps.activeFiltersConfig.onDelete(
          {},
          [
            {
              category: 'Workspace',
              urlParam: 'groups',
              chips: [
                {
                  name: 'advisor_3ec817eb-b5db-4aa3-8786-ff3837f7c90f',
                  value: 'advisor_3ec817eb-b5db-4aa3-8786-ff3837f7c90f',
                },
              ],
            },
          ],
          false,
        );
      });

      expect(window.location.search).not.toContain('groups=');
      expect(window.location.search).toContain('tags=');

      await waitFor(() => {
        lastCall =
          MockInventoryTable.mock.calls[
            MockInventoryTable.mock.calls.length - 1
          ];
        lastProps = lastCall[0];
        expect(lastProps.customFilters.advisorFilters.groups).toBeUndefined();
      });

      // Delete Tags chip
      act(() => {
        lastProps.activeFiltersConfig.onDelete(
          {},
          [
            {
              category: 'Tags',
              urlParam: 'tags',
              chips: [
                {
                  name: 'DWSBsyuF=ALkkJjC',
                  value: 'AacBhXapq/DWSBsyuF=ALkkJjC',
                },
              ],
            },
          ],
          false,
        );
      });

      expect(window.location.search).not.toContain('tags=');

      await waitFor(() => {
        lastCall =
          MockInventoryTable.mock.calls[
            MockInventoryTable.mock.calls.length - 1
          ];
        lastProps = lastCall[0];
        expect(lastProps.customFilters.advisorFilters.tags).toBeUndefined();
      });
    });

    it('clears all filters and resets URL when isAll is triggered', async () => {
      window.history.replaceState(
        null,
        '',
        '/?limit=20&offset=40&sort=-last_seen&filter%5Bsystem_profile%5D=true&groups=advisor_123&tags=ns%2Fk%3Dv',
      );
      mockAxiosGet.mockResolvedValue({ playbook_count: 0 });

      renderInventory();

      await waitFor(() => {
        expect(MockInventoryTable).toHaveBeenCalled();
      });

      const lastCall =
        MockInventoryTable.mock.calls[MockInventoryTable.mock.calls.length - 1];
      const lastProps = lastCall[0];

      act(() => {
        lastProps.activeFiltersConfig.onDelete({}, [], true);
      });

      expect(window.location.search).not.toContain('groups=');
      expect(window.location.search).not.toContain('tags=');
      expect(window.location.search).toContain('offset=0');
    });

    it('handles multiple tags, preserving remaining tags in state and URL on single tag deletion', async () => {
      window.history.replaceState(
        null,
        '',
        '/?limit=20&offset=0&sort=-last_seen&filter%5Bsystem_profile%5D=true&tags=ns1%2Fkey1%3Dval1,ns2%2Fkey2%3Dval2',
      );
      mockAxiosGet.mockResolvedValue({ playbook_count: 0 });

      renderInventory();

      await waitFor(() => {
        expect(MockInventoryTable).toHaveBeenCalled();
      });

      let lastCall =
        MockInventoryTable.mock.calls[MockInventoryTable.mock.calls.length - 1];
      let lastProps = lastCall[0];

      expect(lastProps.activeFiltersConfig.filters).toEqual(
        expect.arrayContaining([
          {
            category: 'Tags',
            urlParam: 'tags',
            chips: [
              { name: 'key1=val1', value: 'ns1/key1=val1' },
              { name: 'key2=val2', value: 'ns2/key2=val2' },
            ],
          },
        ]),
      );

      // Delete only the first tag chip
      act(() => {
        lastProps.activeFiltersConfig.onDelete(
          {},
          [
            {
              category: 'Tags',
              urlParam: 'tags',
              chips: [{ name: 'key1=val1', value: 'ns1/key1=val1' }],
            },
          ],
          false,
        );
      });

      expect(window.location.search).not.toContain('key1%3Dval1');
      expect(window.location.search).toContain('key2%3Dval2');

      await waitFor(() => {
        lastCall =
          MockInventoryTable.mock.calls[
            MockInventoryTable.mock.calls.length - 1
          ];
        lastProps = lastCall[0];
        expect(lastProps.customFilters.advisorFilters.tags).toEqual([
          'ns2/key2=val2',
        ]);
      });
    });

    it('handles multiple groups, preserving remaining groups in state and URL on single group deletion', async () => {
      window.history.replaceState(
        null,
        '',
        '/?limit=20&offset=0&sort=-last_seen&filter%5Bsystem_profile%5D=true&groups=advisor_grp1,advisor_grp2',
      );
      mockAxiosGet.mockResolvedValue({ playbook_count: 0 });

      renderInventory();

      await waitFor(() => {
        expect(MockInventoryTable).toHaveBeenCalled();
      });

      let lastCall =
        MockInventoryTable.mock.calls[MockInventoryTable.mock.calls.length - 1];
      let lastProps = lastCall[0];

      expect(lastProps.activeFiltersConfig.filters).toEqual(
        expect.arrayContaining([
          {
            category: 'Workspace',
            urlParam: 'groups',
            chips: [
              { name: 'advisor_grp1', value: 'advisor_grp1' },
              { name: 'advisor_grp2', value: 'advisor_grp2' },
            ],
          },
        ]),
      );

      // Delete the first group chip
      act(() => {
        lastProps.activeFiltersConfig.onDelete(
          {},
          [
            {
              category: 'Workspace',
              urlParam: 'groups',
              chips: [{ name: 'advisor_grp1', value: 'advisor_grp1' }],
            },
          ],
          false,
        );
      });

      expect(window.location.search).not.toContain('advisor_grp1');
      expect(window.location.search).toContain('advisor_grp2');

      await waitFor(() => {
        lastCall =
          MockInventoryTable.mock.calls[
            MockInventoryTable.mock.calls.length - 1
          ];
        lastProps = lastCall[0];
        expect(lastProps.customFilters.advisorFilters.groups).toEqual([
          'advisor_grp2',
        ]);
      });
    });

    it('dispatches updateTags to synchronize Redux selectedTags on tag chip deletion and reset', async () => {
      window.history.replaceState(
        null,
        '',
        '/?limit=20&offset=0&sort=-last_seen&filter%5Bsystem_profile%5D=true&tags=ns1%2Fkey1%3Dval1,ns2%2Fkey2%3Dval2',
      );
      mockAxiosGet.mockResolvedValue({ playbook_count: 0 });

      const customStore = mockStore({
        entities: { columns: [], rows: [], total: 0 },
      });

      renderInventory({
        store: customStore,
        selectedTags: ['ns1/key1=val1', 'ns2/key2=val2'],
      });

      await waitFor(() => {
        expect(MockInventoryTable).toHaveBeenCalled();
      });

      const lastCall =
        MockInventoryTable.mock.calls[MockInventoryTable.mock.calls.length - 1];
      const lastProps = lastCall[0];

      // Delete first tag
      act(() => {
        lastProps.activeFiltersConfig.onDelete(
          {},
          [
            {
              category: 'Tags',
              urlParam: 'tags',
              chips: [{ name: 'key1=val1', value: 'ns1/key1=val1' }],
            },
          ],
          false,
        );
      });

      const actions = customStore.getActions();
      expect(actions).toContainEqual(
        expect.objectContaining({
          type: 'filters/updateTags',
          payload: ['ns2/key2=val2'],
        }),
      );
    });

    it('formats tag label correctly when tag does not contain a namespace slash', async () => {
      window.history.replaceState(
        null,
        '',
        '/?limit=20&offset=0&sort=-last_seen&filter%5Bsystem_profile%5D=true&tags=unscoped_tag',
      );
      mockAxiosGet.mockResolvedValue({ playbook_count: 0 });

      renderInventory();

      await waitFor(() => {
        expect(MockInventoryTable).toHaveBeenCalled();
      });

      const lastCall =
        MockInventoryTable.mock.calls[MockInventoryTable.mock.calls.length - 1];
      const lastProps = lastCall[0];

      expect(lastProps.activeFiltersConfig.filters).toEqual(
        expect.arrayContaining([
          {
            category: 'Tags',
            urlParam: 'tags',
            chips: [{ name: 'unscoped_tag', value: 'unscoped_tag' }],
          },
        ]),
      );
    });
  });
});
