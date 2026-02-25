import React from 'react';
import '@testing-library/jest-dom';
import {
  paginatedRequestHelper,
  getEntities,
  allCurrentSystemIds,
  iopResolutionsMapper,
  lastSeenColumn,
  impactedDateColumn,
} from './helpers';
import { Get } from '../../Utilities/Api';
import { createOptions, createSortParam } from '../helper';

jest.mock('../../Utilities/Api', () => ({
  Get: jest.fn(),
}));

jest.mock('../helper', () => ({
  createOptions: jest.fn(),
  createSortParam: jest.fn(),
}));

jest.mock('../Common/Tables', () => ({
  mergeArraysByDiffKeys: jest.fn((arr1, arr2) => {
    // Merge arr1 (fetched systems) with arr2 (inventory results)
    return arr1.map((item1) => {
      const match = arr2.find((item2) => item2.id === item1.system_uuid);
      return match ? { ...item1, ...match } : item1;
    });
  }),
}));

describe('Inventory helpers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('paginatedRequestHelper', () => {
    const mockConfig = {
      per_page: 20,
      page: 1,
      advisorFilters: { filter: 'test' },
      filters: {},
      workloads: [],
      sort: 'name',
      selectedTags: [],
      RULES_FETCH_URL: '/api/rules/',
      SYSTEMS_FETCH_URL: '/api/systems/',
    };

    it('fetches systems for pathway', async () => {
      const pathway = { slug: 'test-pathway' };
      const mockOptions = { page: 1, per_page: 20 };
      const mockData = { data: [{ id: '1' }], meta: { count: 1 } };

      createOptions.mockReturnValue(mockOptions);
      Get.mockResolvedValue({ data: mockData });

      const systemsData = await paginatedRequestHelper({
        ...mockConfig,
        pathway,
      });

      expect(createOptions).toHaveBeenCalled();
      expect(Get).toHaveBeenCalledWith(
        '/api/systems/',
        {},
        { ...mockOptions, pathway: 'test-pathway' },
      );
      expect(systemsData).toEqual(mockData);
    });

    it('fetches systems for rule', async () => {
      const rule = { rule_id: 'TEST_RULE_123' };
      const mockOptions = { page: 1, per_page: 20 };
      const mockData = { data: [{ id: '1' }], meta: { count: 1 } };

      createOptions.mockReturnValue(mockOptions);
      Get.mockResolvedValue({ data: mockData });

      const systemsData = await paginatedRequestHelper({
        ...mockConfig,
        rule,
        pathway: null,
      });

      expect(Get).toHaveBeenCalledWith(
        '/api/rules/TEST_RULE_123/systems_detail/',
        {},
        mockOptions,
      );
      expect(systemsData).toEqual(mockData);
    });

    it('encodes rule_id in URL', async () => {
      const rule = { rule_id: 'TEST RULE WITH SPACES' };
      const mockOptions = { page: 1, per_page: 20 };

      createOptions.mockReturnValue(mockOptions);
      Get.mockResolvedValue({ data: { data: [], meta: { count: 0 } } });

      await paginatedRequestHelper({
        ...mockConfig,
        rule,
        pathway: null,
      });

      expect(Get).toHaveBeenCalledWith(
        '/api/rules/TEST%20RULE%20WITH%20SPACES/systems_detail/',
        {},
        mockOptions,
      );
    });
  });

  describe('getEntities', () => {
    const mockHandleRefresh = jest.fn();
    const mockSetCurPageIds = jest.fn();
    const mockSetTotal = jest.fn();
    const mockSetFullFilters = jest.fn();
    const mockDefaultGetEntities = jest.fn();
    const mockAxios = jest.fn();

    const rule = { rule_id: 'TEST_RULE' };
    const RULES_FETCH_URL = '/api/rules/';
    const SYSTEMS_FETCH_URL = '/api/systems/';

    const config = {
      per_page: 20,
      page: 1,
      orderBy: 'display_name',
      orderDirection: 'asc',
      advisorFilters: {},
      filters: {},
      workloads: [],
      selectedTags: [],
    };

    beforeEach(() => {
      jest.clearAllMocks();
      createSortParam.mockReturnValue('display_name:asc');
      createOptions.mockReturnValue({ page: 1, per_page: 20 });
    });

    it('fetches and processes entities successfully', async () => {
      const selectedIds = ['uuid-1', 'uuid-2'];
      const mockFetchedSystems = {
        data: [
          { system_uuid: 'uuid-1', name: 'System 1' },
          { system_uuid: 'uuid-2', name: 'System 2' },
        ],
        meta: { count: 2 },
      };
      const mockDefaultEntities = {
        results: [
          { id: 'uuid-1', display_name: 'System 1' },
          { id: 'uuid-2', display_name: 'System 2' },
        ],
      };

      Get.mockResolvedValue({ data: mockFetchedSystems });
      mockDefaultGetEntities.mockResolvedValue(mockDefaultEntities);

      const fetchEntities = getEntities(
        mockHandleRefresh,
        null,
        mockSetCurPageIds,
        mockSetTotal,
        selectedIds,
        mockSetFullFilters,
        {},
        rule,
        RULES_FETCH_URL,
        SYSTEMS_FETCH_URL,
        mockAxios,
      );

      const entitiesData = await fetchEntities(
        [],
        config,
        true,
        mockDefaultGetEntities,
      );

      expect(mockHandleRefresh).toHaveBeenCalled();
      expect(mockSetFullFilters).toHaveBeenCalled();
      expect(mockSetCurPageIds).toHaveBeenCalledWith(['uuid-1', 'uuid-2']);
      expect(mockSetTotal).toHaveBeenCalledWith(2);
      expect(entitiesData.total).toBe(2);
      expect(entitiesData.results).toHaveLength(2);
    });

    it('marks selected items correctly', async () => {
      const selectedIds = ['uuid-1'];
      const mockFetchedSystems = {
        data: [
          { system_uuid: 'uuid-1', name: 'System 1' },
          { system_uuid: 'uuid-2', name: 'System 2' },
        ],
        meta: { count: 2 },
      };
      const mockDefaultEntities = {
        results: [
          { id: 'uuid-1', display_name: 'System 1' },
          { id: 'uuid-2', display_name: 'System 2' },
        ],
      };

      Get.mockResolvedValue({ data: mockFetchedSystems });
      mockDefaultGetEntities.mockResolvedValue(mockDefaultEntities);

      const fetchEntities = getEntities(
        mockHandleRefresh,
        null,
        mockSetCurPageIds,
        mockSetTotal,
        selectedIds,
        mockSetFullFilters,
        {},
        rule,
        RULES_FETCH_URL,
        SYSTEMS_FETCH_URL,
        mockAxios,
      );

      const entitiesData = await fetchEntities(
        [],
        config,
        true,
        mockDefaultGetEntities,
      );

      expect(entitiesData.results[0].selected).toBe(true);
      expect(entitiesData.results[1].selected).toBe(false);
    });

    it('calls defaultGetEntities with correct parameters', async () => {
      const mockFetchedSystems = {
        data: [{ system_uuid: 'uuid-1' }],
        meta: { count: 1 },
      };

      Get.mockResolvedValue({ data: mockFetchedSystems });
      mockDefaultGetEntities.mockResolvedValue({ results: [] });

      const fetchEntities = getEntities(
        mockHandleRefresh,
        null,
        mockSetCurPageIds,
        mockSetTotal,
        [],
        mockSetFullFilters,
        {},
        rule,
        RULES_FETCH_URL,
        SYSTEMS_FETCH_URL,
        mockAxios,
      );

      await fetchEntities([], config, true, mockDefaultGetEntities);

      expect(mockDefaultGetEntities).toHaveBeenCalledWith(
        ['uuid-1'],
        {
          per_page: 20,
          hasItems: true,
          fields: { system_profile: ['operating_system'] },
          axios: mockAxios,
        },
        true,
      );
    });
  });

  describe('allCurrentSystemIds', () => {
    const mockSetIsLoading = jest.fn();
    const rule = { rule_id: 'TEST_RULE' };
    const fullFilters = {
      per_page: 20,
      page: 1,
      RULES_FETCH_URL: '/api/rules/',
      SYSTEMS_FETCH_URL: '/api/systems/',
      rule,
    };

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('fetches all system IDs across multiple pages', async () => {
      const total = 250;
      const mockPage1 = {
        data: Array.from({ length: 100 }, (_, i) => ({
          system_uuid: `uuid-${i}`,
        })),
      };
      const mockPage2 = {
        data: Array.from({ length: 100 }, (_, i) => ({
          system_uuid: `uuid-${i + 100}`,
        })),
      };
      const mockPage3 = {
        data: Array.from({ length: 50 }, (_, i) => ({
          system_uuid: `uuid-${i + 200}`,
        })),
      };

      Get.mockResolvedValueOnce({ data: mockPage1 })
        .mockResolvedValueOnce({ data: mockPage2 })
        .mockResolvedValueOnce({ data: mockPage3 });

      const fetchIds = allCurrentSystemIds(
        fullFilters,
        total,
        rule,
        mockSetIsLoading,
      );
      const systemIds = await fetchIds();

      expect(mockSetIsLoading).toHaveBeenCalledWith(true);
      expect(mockSetIsLoading).toHaveBeenCalledWith(false);
      expect(systemIds).toHaveLength(250);
      expect(systemIds[0]).toBe('uuid-0');
      expect(systemIds[249]).toBe('uuid-249');
    });

    it('handles single page correctly', async () => {
      const total = 50;
      const mockData = {
        data: Array.from({ length: 50 }, (_, i) => ({
          system_uuid: `uuid-${i}`,
        })),
      };

      Get.mockResolvedValue({ data: mockData });

      const fetchIds = allCurrentSystemIds(
        fullFilters,
        total,
        rule,
        mockSetIsLoading,
      );
      const result = await fetchIds();

      expect(Get).toHaveBeenCalledTimes(1);
      expect(result).toHaveLength(50);
    });

    it('sets loading state correctly', async () => {
      const total = 10;
      Get.mockResolvedValue({
        data: { data: [{ system_uuid: 'uuid-1' }] },
      });

      const fetchIds = allCurrentSystemIds(
        fullFilters,
        total,
        rule,
        mockSetIsLoading,
      );
      await fetchIds();

      expect(mockSetIsLoading).toHaveBeenNthCalledWith(1, true);
      expect(mockSetIsLoading).toHaveBeenNthCalledWith(2, false);
    });
  });

  describe('iopResolutionsMapper', () => {
    const originalFetch = global.fetch;
    const mockRule = {
      rule_id: 'TEST_RULE',
      description: 'Test rule description',
      reboot_required: true,
    };

    beforeEach(() => {
      global.fetch = jest.fn();
      document.querySelector = jest.fn().mockReturnValue({
        getAttribute: jest.fn().mockReturnValue('test-csrf-token'),
      });
    });

    afterEach(() => {
      global.fetch = originalFetch;
    });

    it('fetches and maps resolutions successfully', async () => {
      const entities = {
        rows: [
          { id: 'uuid-1', display_name: 'System 1' },
          { id: 'uuid-2', display_name: 'System 2' },
        ],
      };
      const selectedIds = ['uuid-1', 'uuid-2'];
      const mockResolutions = [
        { id: 'resolution-1', description: 'Fix 1' },
        { id: 'resolution-2', description: 'Fix 2' },
      ];

      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          'advisor:TEST_RULE': { resolutions: mockResolutions },
        }),
      });

      const resolutionsData = await iopResolutionsMapper(
        entities,
        mockRule,
        selectedIds,
      );

      expect(resolutionsData).toHaveLength(2);
      expect(resolutionsData[0]).toEqual({
        hostid: 'uuid-1',
        host_name: 'System 1',
        resolutions: mockResolutions,
        rulename: 'TEST_RULE',
        description: 'Test rule description',
        rebootable: true,
      });
      expect(resolutionsData[1]).toEqual({
        hostid: 'uuid-2',
        host_name: 'System 2',
        resolutions: mockResolutions,
        rulename: 'TEST_RULE',
        description: 'Test rule description',
        rebootable: true,
      });
    });

    it('uses system ID as fallback when display_name not found', async () => {
      const entities = {
        rows: [{ id: 'uuid-1', display_name: 'System 1' }],
      };
      const selectedIds = ['uuid-1', 'uuid-unknown'];

      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          'advisor:TEST_RULE': { resolutions: [] },
        }),
      });

      const resolutionsData = await iopResolutionsMapper(
        entities,
        mockRule,
        selectedIds,
      );

      expect(resolutionsData[0].host_name).toBe('System 1');
      expect(resolutionsData[1].host_name).toBe('uuid-unknown');
    });

    it('handles missing resolutions gracefully', async () => {
      const entities = { rows: [] };
      const selectedIds = ['uuid-1'];

      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          'advisor:TEST_RULE': {},
        }),
      });

      const resolutionsData = await iopResolutionsMapper(
        entities,
        mockRule,
        selectedIds,
      );

      expect(resolutionsData[0].resolutions).toEqual([]);
    });

    it('sends correct fetch request', async () => {
      const entities = { rows: [] };
      const selectedIds = ['uuid-1'];

      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => ({ 'advisor:TEST_RULE': { resolutions: [] } }),
      });

      await iopResolutionsMapper(entities, mockRule, selectedIds);

      expect(global.fetch).toHaveBeenCalledWith(
        '/insights_cloud/api/remediations/v1/resolutions',
        {
          method: 'POST',
          headers: {
            'content-type': 'application/json; charset=utf-8',
            'X-CSRF-Token': 'test-csrf-token',
          },
          body: JSON.stringify({ issues: ['advisor:TEST_RULE'] }),
        },
      );
    });

    it('returns empty array on fetch error', async () => {
      const entities = { rows: [] };
      const selectedIds = ['uuid-1'];
      const consoleErrorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      global.fetch.mockResolvedValue({
        ok: false,
        status: 500,
        text: async () => 'Internal Server Error',
      });

      const resolutionsData = await iopResolutionsMapper(
        entities,
        mockRule,
        selectedIds,
      );

      expect(resolutionsData).toEqual([]);
      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });

    it('returns empty array on network error', async () => {
      const entities = { rows: [] };
      const selectedIds = ['uuid-1'];
      const consoleErrorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      global.fetch.mockRejectedValue(new Error('Network error'));

      const resolutionsData = await iopResolutionsMapper(
        entities,
        mockRule,
        selectedIds,
      );

      expect(resolutionsData).toEqual([]);
      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });
  });

  describe('Column configurations', () => {
    describe('lastSeenColumn', () => {
      it('has correct configuration', () => {
        expect(lastSeenColumn.key).toBe('last_seen');
        expect(lastSeenColumn.sortKey).toBe('last_seen');
        expect(lastSeenColumn.props.width).toBe(10);
        expect(lastSeenColumn.transforms).toBeDefined();
      });

      it('has a title component', () => {
        expect(React.isValidElement(lastSeenColumn.title)).toBe(true);
      });

      it('has a renderFunc', () => {
        expect(typeof lastSeenColumn.renderFunc).toBe('function');
      });

      it('renderFunc returns DateFormat component', () => {
        const date = '2024-01-15T10:30:00Z';
        const view = lastSeenColumn.renderFunc(date);
        expect(React.isValidElement(view)).toBe(true);
        expect(view.props.date).toBe(date);
        expect(view.props.extraTitle).toBe('Last Seen: ');
      });
    });

    describe('impactedDateColumn', () => {
      it('has correct configuration', () => {
        expect(impactedDateColumn.key).toBe('impacted_date');
        expect(impactedDateColumn.title).toBe('First impacted');
        expect(impactedDateColumn.sortKey).toBe('impacted_date');
        expect(impactedDateColumn.props.width).toBe(15);
        expect(impactedDateColumn.transforms).toBeDefined();
      });

      it('has a renderFunc', () => {
        expect(typeof impactedDateColumn.renderFunc).toBe('function');
      });

      it('renderFunc returns DateFormat component', () => {
        const date = '2024-01-10T08:00:00Z';
        const view = impactedDateColumn.renderFunc(date);
        expect(React.isValidElement(view)).toBe(true);
        expect(view.props.date).toBe(date);
        expect(view.props.extraTitle).toBe('First impacted: ');
      });
    });
  });
});
