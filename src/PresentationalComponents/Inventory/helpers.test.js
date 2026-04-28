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
import { createOptions, createSortParam } from '../helper';
import Qs from 'qs';

const mockAxiosGet = jest.fn();

jest.mock('../helper', () => ({
  createOptions: jest.fn(),
  createSortParam: jest.fn(),
  getCsrfTokenHeader: jest.fn(() => ({ 'X-CSRF-Token': 'test-csrf-token' })),
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
    const mockAxios = {
      get: mockAxiosGet,
    };

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
      axios: mockAxios,
    };

    it('fetches systems for pathway', async () => {
      const pathway = { slug: 'test-pathway' };
      const mockOptions = { page: 1, per_page: 20 };
      const mockData = { data: [{ id: '1' }], meta: { count: 1 } };

      createOptions.mockReturnValue(mockOptions);
      mockAxiosGet.mockResolvedValue(mockData);

      const systemsData = await paginatedRequestHelper({
        ...mockConfig,
        pathway,
      });

      expect(createOptions).toHaveBeenCalled();
      expect(mockAxiosGet).toHaveBeenCalledWith('/api/systems/', {
        params: { ...mockOptions, pathway: 'test-pathway' },
        paramsSerializer: expect.any(Function),
      });
      expect(systemsData).toEqual(mockData);
    });

    it('fetches systems for rule', async () => {
      const rule = { rule_id: 'TEST_RULE_123' };
      const mockOptions = { page: 1, per_page: 20 };
      const mockData = { data: [{ id: '1' }], meta: { count: 1 } };

      createOptions.mockReturnValue(mockOptions);
      mockAxiosGet.mockResolvedValue(mockData);

      const systemsData = await paginatedRequestHelper({
        ...mockConfig,
        rule,
        pathway: null,
      });

      expect(mockAxiosGet).toHaveBeenCalledWith(
        '/api/rules/TEST_RULE_123/systems_detail/',
        {
          params: mockOptions,
          paramsSerializer: expect.any(Function),
        },
      );
      expect(systemsData).toEqual(mockData);
    });

    it('encodes rule_id in URL', async () => {
      const rule = { rule_id: 'TEST RULE WITH SPACES' };
      const mockOptions = { page: 1, per_page: 20 };

      createOptions.mockReturnValue(mockOptions);
      mockAxiosGet.mockResolvedValue({ data: [], meta: { count: 0 } });

      await paginatedRequestHelper({
        ...mockConfig,
        rule,
        pathway: null,
      });

      expect(mockAxiosGet).toHaveBeenCalledWith(
        '/api/rules/TEST%20RULE%20WITH%20SPACES/systems_detail/',
        {
          params: mockOptions,
          paramsSerializer: expect.any(Function),
        },
      );
    });

    it('serializes array parameters with repeat format', async () => {
      const pathway = { slug: 'test-pathway' };
      const mockOptions = {
        page: 1,
        per_page: 20,
        tags: ['tag1', 'tag2', 'tag3'],
        incident: ['true', 'false'],
      };

      createOptions.mockReturnValue(mockOptions);
      mockAxiosGet.mockResolvedValue({ data: [], meta: { count: 0 } });

      await paginatedRequestHelper({
        ...mockConfig,
        pathway,
      });

      const call = mockAxiosGet.mock.calls[0];
      const paramsSerializer = call[1].paramsSerializer;
      const actualParams = call[1].params;
      const serialized = paramsSerializer(actualParams);

      expect(serialized).toBe(
        Qs.stringify(
          { ...mockOptions, pathway: 'test-pathway' },
          { arrayFormat: 'repeat' },
        ),
      );
    });

    it('serializes array parameters for rule requests', async () => {
      const rule = { rule_id: 'TEST_RULE' };
      const mockOptions = {
        page: 1,
        per_page: 20,
        incident: ['true', 'false'],
        likelihood: ['1', '2', '3'],
      };

      createOptions.mockReturnValue(mockOptions);
      mockAxiosGet.mockResolvedValue({ data: [], meta: { count: 0 } });

      await paginatedRequestHelper({
        ...mockConfig,
        rule,
        pathway: null,
      });

      const call = mockAxiosGet.mock.calls[0];
      const paramsSerializer = call[1].paramsSerializer;
      const actualParams = call[1].params;
      const serialized = paramsSerializer(actualParams);

      expect(serialized).toBe(
        Qs.stringify(mockOptions, { arrayFormat: 'repeat' }),
      );
      expect(serialized).toContain('incident=true&incident=false');
      expect(serialized).toContain('likelihood=1&likelihood=2&likelihood=3');
    });

    it('serializes mixed parameter types correctly', async () => {
      const pathway = { slug: 'test-pathway' };
      const mockOptions = {
        page: 1,
        per_page: 20,
        name: 'system-name',
        tags: ['tag1', 'tag2'],
        incident: ['true'],
        enabled: 'true',
      };

      createOptions.mockReturnValue(mockOptions);
      mockAxiosGet.mockResolvedValue({ data: [], meta: { count: 0 } });

      await paginatedRequestHelper({
        ...mockConfig,
        pathway,
      });

      const call = mockAxiosGet.mock.calls[0];
      const paramsSerializer = call[1].paramsSerializer;
      const actualParams = call[1].params;
      const serialized = paramsSerializer(actualParams);

      expect(serialized).toContain('tags=tag1&tags=tag2');
      expect(serialized).toContain('incident=true');
      expect(serialized).toContain('name=system-name');
      expect(serialized).toContain('enabled=true');
      expect(serialized).toContain('pathway=test-pathway');
    });

    it('handles empty arrays in paramsSerializer', async () => {
      const pathway = { slug: 'test-pathway' };
      const mockOptions = {
        page: 1,
        per_page: 20,
        tags: [],
        incident: [],
      };

      createOptions.mockReturnValue(mockOptions);
      mockAxiosGet.mockResolvedValue({ data: [], meta: { count: 0 } });

      await paginatedRequestHelper({
        ...mockConfig,
        pathway,
      });

      const call = mockAxiosGet.mock.calls[0];
      const paramsSerializer = call[1].paramsSerializer;
      const actualParams = call[1].params;
      const serialized = paramsSerializer(actualParams);

      expect(serialized).toBe(
        Qs.stringify(
          { ...mockOptions, pathway: 'test-pathway' },
          { arrayFormat: 'repeat' },
        ),
      );
      // Empty arrays should not appear in the serialized string
      expect(serialized).not.toContain('tags=');
      expect(serialized).not.toContain('incident=');
    });

    it('handles single-item arrays correctly', async () => {
      const pathway = { slug: 'test-pathway' };
      const mockOptions = {
        page: 1,
        per_page: 20,
        impact: ['2'],
      };

      createOptions.mockReturnValue(mockOptions);
      mockAxiosGet.mockResolvedValue({ data: [], meta: { count: 0 } });

      await paginatedRequestHelper({
        ...mockConfig,
        pathway,
      });

      const call = mockAxiosGet.mock.calls[0];
      const paramsSerializer = call[1].paramsSerializer;
      const actualParams = call[1].params;
      const serialized = paramsSerializer(actualParams);

      expect(serialized).toContain('impact=2');
      // Should use repeat format even for single items
      expect(serialized).toBe(
        Qs.stringify(
          { ...mockOptions, pathway: 'test-pathway' },
          { arrayFormat: 'repeat' },
        ),
      );
    });

    it('handles special characters in array values', async () => {
      const rule = { rule_id: 'TEST_RULE' };
      const mockOptions = {
        page: 1,
        per_page: 20,
        tags: ['tag with spaces', 'tag/with/slashes', 'tag&with&ampersand'],
      };

      createOptions.mockReturnValue(mockOptions);
      mockAxiosGet.mockResolvedValue({ data: [], meta: { count: 0 } });

      await paginatedRequestHelper({
        ...mockConfig,
        rule,
        pathway: null,
      });

      const call = mockAxiosGet.mock.calls[0];
      const paramsSerializer = call[1].paramsSerializer;
      const actualParams = call[1].params;
      const serialized = paramsSerializer(actualParams);

      // Special characters should be properly encoded
      expect(serialized).toContain('tag%20with%20spaces');
      expect(serialized).toContain('tag%2Fwith%2Fslashes');
      expect(serialized).toContain('tag%26with%26ampersand');
    });

    it('paramsSerializer uses repeat format consistently', async () => {
      const pathway = { slug: 'test-pathway' };
      const mockOptions = {
        page: 1,
        per_page: 20,
        category: ['1', '2', '3', '4'],
      };

      createOptions.mockReturnValue(mockOptions);
      mockAxiosGet.mockResolvedValue({ data: [], meta: { count: 0 } });

      await paginatedRequestHelper({
        ...mockConfig,
        pathway,
      });

      const call = mockAxiosGet.mock.calls[0];
      const paramsSerializer = call[1].paramsSerializer;
      const actualParams = call[1].params;
      const serialized = paramsSerializer(actualParams);

      // Verify it uses repeat format (category=1&category=2&category=3&category=4)
      // not indices (category[0]=1&category[1]=2) or brackets (category[]=1&category[]=2)
      expect(serialized).toContain(
        'category=1&category=2&category=3&category=4',
      );
      expect(serialized).not.toContain('category[0]');
      expect(serialized).not.toContain('category[]');
    });
  });

  describe('getEntities', () => {
    const mockHandleRefresh = jest.fn();
    const mockSetCurPageIds = jest.fn();
    const mockSetTotal = jest.fn();
    const mockSetFullFilters = jest.fn();
    const mockDefaultGetEntities = jest.fn();
    const mockAxios = {
      get: mockAxiosGet,
    };

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

      mockAxiosGet.mockResolvedValue(mockFetchedSystems);
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

      mockAxiosGet.mockResolvedValue(mockFetchedSystems);
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

      mockAxiosGet.mockResolvedValue(mockFetchedSystems);
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
        },
        true,
      );
    });

    describe('last_seen null filtering', () => {
      it('filters out systems with last_seen null', async () => {
        const mockFetchedSystems = {
          data: [
            { system_uuid: 'uuid-1', last_seen: '2026-04-14T10:00:00Z' },
            { system_uuid: 'uuid-2', last_seen: null },
            { system_uuid: 'uuid-3', last_seen: '2026-04-13T10:00:00Z' },
          ],
          meta: { count: 3 },
        };
        const mockDefaultEntities = {
          results: [{ id: 'uuid-1' }, { id: 'uuid-3' }],
        };

        mockAxiosGet.mockResolvedValue(mockFetchedSystems);
        mockDefaultGetEntities.mockResolvedValue(mockDefaultEntities);

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

        const result = await fetchEntities(
          [],
          config,
          true,
          mockDefaultGetEntities,
        );

        expect(mockDefaultGetEntities).toHaveBeenCalledWith(
          ['uuid-1', 'uuid-3'],
          expect.any(Object),
          true,
        );
        expect(mockSetCurPageIds).toHaveBeenCalledWith(['uuid-1', 'uuid-3']);
        expect(result.results).toHaveLength(2);
      });

      it('adjusts total count when filtering systems', async () => {
        const mockFetchedSystems = {
          data: [
            { system_uuid: 'uuid-1', last_seen: '2026-04-14T10:00:00Z' },
            { system_uuid: 'uuid-2', last_seen: null },
            { system_uuid: 'uuid-3', last_seen: null },
          ],
          meta: { count: 100 },
        };
        const mockDefaultEntities = {
          results: [{ id: 'uuid-1' }],
        };

        mockAxiosGet.mockResolvedValue(mockFetchedSystems);
        mockDefaultGetEntities.mockResolvedValue(mockDefaultEntities);

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

        const result = await fetchEntities(
          [],
          config,
          true,
          mockDefaultGetEntities,
        );

        expect(mockSetTotal).toHaveBeenCalledWith(98);
        expect(result.total).toBe(98);
      });

      it('skips Inventory API call when all systems have last_seen null', async () => {
        const mockFetchedSystems = {
          data: [
            { system_uuid: 'uuid-1', last_seen: null },
            { system_uuid: 'uuid-2', last_seen: null },
          ],
          meta: { count: 2 },
        };

        mockAxiosGet.mockResolvedValue(mockFetchedSystems);

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

        const result = await fetchEntities(
          [],
          config,
          true,
          mockDefaultGetEntities,
        );

        expect(mockDefaultGetEntities).not.toHaveBeenCalled();
        expect(mockSetCurPageIds).toHaveBeenCalledWith([]);
        expect(mockSetTotal).toHaveBeenCalledWith(0);
        expect(result.results).toHaveLength(0);
        expect(result.total).toBe(0);
      });

      it('handles 404 errors from Inventory API gracefully', async () => {
        const mockFetchedSystems = {
          data: [{ system_uuid: 'uuid-1', last_seen: '2026-04-14T10:00:00Z' }],
          meta: { count: 1 },
        };

        mockAxiosGet.mockResolvedValue(mockFetchedSystems);
        mockDefaultGetEntities.mockRejectedValue({
          response: { status: 404 },
          message: 'Not found',
        });

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

        const result = await fetchEntities(
          [],
          config,
          true,
          mockDefaultGetEntities,
        );

        expect(result.results).toHaveLength(1);
        expect(result.total).toBe(1);
      });

      it('rethrows non-404 errors from Inventory API', async () => {
        const mockFetchedSystems = {
          data: [{ system_uuid: 'uuid-1', last_seen: '2026-04-14T10:00:00Z' }],
          meta: { count: 1 },
        };
        const serverError = {
          response: { status: 500 },
          message: 'Internal server error',
        };

        mockAxiosGet.mockResolvedValue(mockFetchedSystems);
        mockDefaultGetEntities.mockRejectedValue(serverError);

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

        await expect(
          fetchEntities([], config, true, mockDefaultGetEntities),
        ).rejects.toEqual(serverError);
      });
    });
  });

  describe('allCurrentSystemIds', () => {
    const mockSetIsLoading = jest.fn();
    const rule = { rule_id: 'TEST_RULE' };
    const mockAxios = {
      get: mockAxiosGet,
    };
    const fullFilters = {
      per_page: 20,
      page: 1,
      RULES_FETCH_URL: '/api/rules/',
      SYSTEMS_FETCH_URL: '/api/systems/',
      rule,
      axios: mockAxios,
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

      mockAxiosGet
        .mockResolvedValueOnce(mockPage1)
        .mockResolvedValueOnce(mockPage2)
        .mockResolvedValueOnce(mockPage3);

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

      mockAxiosGet.mockResolvedValue(mockData);

      const fetchIds = allCurrentSystemIds(
        fullFilters,
        total,
        rule,
        mockSetIsLoading,
      );
      const result = await fetchIds();

      expect(mockAxiosGet).toHaveBeenCalledTimes(1);
      expect(result).toHaveLength(50);
    });

    it('sets loading state correctly', async () => {
      const total = 10;
      mockAxiosGet.mockResolvedValue({
        data: [{ system_uuid: 'uuid-1' }],
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

    it('returns empty array when rule is undefined', async () => {
      const entities = { rows: [] };
      const selectedIds = ['uuid-1'];
      const consoleErrorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const resolutionsData = await iopResolutionsMapper(
        entities,
        undefined,
        selectedIds,
      );

      expect(resolutionsData).toEqual([]);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Rule ID is missing, cannot fetch remediation resolutions',
      );
      expect(global.fetch).not.toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });

    it('returns empty array when rule is null', async () => {
      const entities = { rows: [] };
      const selectedIds = ['uuid-1'];
      const consoleErrorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const resolutionsData = await iopResolutionsMapper(
        entities,
        null,
        selectedIds,
      );

      expect(resolutionsData).toEqual([]);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Rule ID is missing, cannot fetch remediation resolutions',
      );
      expect(global.fetch).not.toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });

    it('returns empty array when rule_id is missing', async () => {
      const entities = { rows: [] };
      const selectedIds = ['uuid-1'];
      const ruleWithoutId = {
        description: 'Test rule',
        reboot_required: false,
      };
      const consoleErrorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const resolutionsData = await iopResolutionsMapper(
        entities,
        ruleWithoutId,
        selectedIds,
      );

      expect(resolutionsData).toEqual([]);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Rule ID is missing, cannot fetch remediation resolutions',
      );
      expect(global.fetch).not.toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });

    it('returns empty array when rule_id is empty string', async () => {
      const entities = { rows: [] };
      const selectedIds = ['uuid-1'];
      const ruleWithEmptyId = {
        rule_id: '',
        description: 'Test rule',
        reboot_required: false,
      };
      const consoleErrorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const resolutionsData = await iopResolutionsMapper(
        entities,
        ruleWithEmptyId,
        selectedIds,
      );

      expect(resolutionsData).toEqual([]);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Rule ID is missing, cannot fetch remediation resolutions',
      );
      expect(global.fetch).not.toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });

    it('handles empty selectedIds array', async () => {
      const entities = { rows: [] };
      const selectedIds = [];

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

      expect(resolutionsData).toEqual([]);
      expect(global.fetch).toHaveBeenCalled();
    });

    it('handles missing entities.rows', async () => {
      const entities = {};
      const selectedIds = ['uuid-1', 'uuid-2'];

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

      expect(resolutionsData).toHaveLength(2);
      expect(resolutionsData[0].host_name).toBe('uuid-1');
      expect(resolutionsData[1].host_name).toBe('uuid-2');
    });

    it('handles reboot_required false', async () => {
      const entities = {
        rows: [{ id: 'uuid-1', display_name: 'System 1' }],
      };
      const selectedIds = ['uuid-1'];
      const ruleNoReboot = {
        rule_id: 'NO_REBOOT_RULE',
        description: 'No reboot needed',
        reboot_required: false,
      };

      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          'advisor:NO_REBOOT_RULE': { resolutions: [] },
        }),
      });

      const resolutionsData = await iopResolutionsMapper(
        entities,
        ruleNoReboot,
        selectedIds,
      );

      expect(resolutionsData[0].rebootable).toBe(false);
    });

    it('handles missing description', async () => {
      const entities = {
        rows: [{ id: 'uuid-1', display_name: 'System 1' }],
      };
      const selectedIds = ['uuid-1'];
      const ruleNoDescription = {
        rule_id: 'NO_DESC_RULE',
        reboot_required: true,
      };

      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          'advisor:NO_DESC_RULE': { resolutions: [] },
        }),
      });

      const resolutionsData = await iopResolutionsMapper(
        entities,
        ruleNoDescription,
        selectedIds,
      );

      expect(resolutionsData[0].description).toBeUndefined();
    });

    it('handles large number of selected systems', async () => {
      const entities = {
        rows: Array.from({ length: 100 }, (_, i) => ({
          id: `uuid-${i}`,
          display_name: `System ${i}`,
        })),
      };
      const selectedIds = Array.from({ length: 100 }, (_, i) => `uuid-${i}`);
      const mockResolutions = [{ id: 'resolution-1', description: 'Fix' }];

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

      expect(resolutionsData).toHaveLength(100);
      expect(resolutionsData[0].hostid).toBe('uuid-0');
      expect(resolutionsData[99].hostid).toBe('uuid-99');
      expect(
        resolutionsData.every((item) => item.resolutions === mockResolutions),
      ).toBe(true);
    });

    it('handles response with empty resolutions array', async () => {
      const entities = {
        rows: [{ id: 'uuid-1', display_name: 'System 1' }],
      };
      const selectedIds = ['uuid-1'];

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

      expect(resolutionsData[0].resolutions).toEqual([]);
    });

    it('formats rule ID with advisor prefix correctly', async () => {
      const entities = { rows: [] };
      const selectedIds = ['uuid-1'];
      const specialRule = {
        rule_id: 'SPECIAL|RULE_WITH_CHARS',
        description: 'Special rule',
        reboot_required: false,
      };

      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          'advisor:SPECIAL|RULE_WITH_CHARS': { resolutions: [] },
        }),
      });

      await iopResolutionsMapper(entities, specialRule, selectedIds);

      expect(global.fetch).toHaveBeenCalledWith(
        '/insights_cloud/api/remediations/v1/resolutions',
        expect.objectContaining({
          body: JSON.stringify({ issues: ['advisor:SPECIAL|RULE_WITH_CHARS'] }),
        }),
      );
    });

    it('includes CSRF token in headers', async () => {
      const entities = { rows: [] };
      const selectedIds = ['uuid-1'];

      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => ({ 'advisor:TEST_RULE': { resolutions: [] } }),
      });

      await iopResolutionsMapper(entities, mockRule, selectedIds);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-CSRF-Token': 'test-csrf-token',
          }),
        }),
      );
    });

    it('handles HTTP 404 error specifically', async () => {
      const entities = { rows: [] };
      const selectedIds = ['uuid-1'];
      const consoleErrorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      global.fetch.mockResolvedValue({
        ok: false,
        status: 404,
        text: async () => 'Not found',
      });

      const resolutionsData = await iopResolutionsMapper(
        entities,
        mockRule,
        selectedIds,
      );

      expect(resolutionsData).toEqual([]);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'An error occurred during fetch:',
        expect.any(Error),
      );

      consoleErrorSpy.mockRestore();
    });

    it('handles HTTP 403 forbidden error', async () => {
      const entities = { rows: [] };
      const selectedIds = ['uuid-1'];
      const consoleErrorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      global.fetch.mockResolvedValue({
        ok: false,
        status: 403,
        text: async () => 'Forbidden',
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

    it('preserves all rule properties in mapped data', async () => {
      const entities = {
        rows: [{ id: 'uuid-1', display_name: 'System 1' }],
      };
      const selectedIds = ['uuid-1'];
      const detailedRule = {
        rule_id: 'DETAILED_RULE',
        description: 'Detailed description',
        reboot_required: true,
      };

      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          'advisor:DETAILED_RULE': { resolutions: [] },
        }),
      });

      const resolutionsData = await iopResolutionsMapper(
        entities,
        detailedRule,
        selectedIds,
      );

      expect(resolutionsData[0]).toEqual({
        hostid: 'uuid-1',
        host_name: 'System 1',
        resolutions: [],
        rulename: 'DETAILED_RULE',
        description: 'Detailed description',
        rebootable: true,
      });
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
