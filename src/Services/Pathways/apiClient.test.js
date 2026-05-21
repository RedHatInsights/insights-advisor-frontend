import { fetchPathways, fetchPathway } from './apiClient';
import instance from '@redhat-cloud-services/frontend-components-utilities/interceptors';

jest.mock('@redhat-cloud-services/frontend-components-utilities/interceptors');

describe('Pathways API Client', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchPathways', () => {
    it('should fetch pathways with query parameters', async () => {
      const mockResponse = {
        data: {
          data: [{ slug: 'pathway-1', name: 'Test Pathway' }],
          meta: { count: 1, total: 1 },
        },
      };
      instance.get.mockResolvedValue(mockResponse);

      const result = await fetchPathways({
        offset: 0,
        limit: 20,
        sort: '-name',
      });

      expect(instance.get).toHaveBeenCalledWith(
        expect.stringContaining('/pathway/?offset=0&limit=20&sort=-name'),
      );
      expect(result).toEqual(mockResponse.data);
    });

    it('should handle array parameters', async () => {
      const mockResponse = {
        data: {
          data: [],
          meta: { count: 0, total: 0 },
        },
      };
      instance.get.mockResolvedValue(mockResponse);

      await fetchPathways({
        category: ['1', '2'],
        tags: 'tag1,tag2',
      });

      expect(instance.get).toHaveBeenCalledWith(
        expect.stringContaining('category=1&category=2'),
      );
    });

    it('should handle response with data and meta', async () => {
      const mockResponse = {
        data: {
          data: [{ slug: 'test' }],
          meta: { count: 1 },
        },
      };
      instance.get.mockResolvedValue(mockResponse);

      const result = await fetchPathways({});

      expect(result).toEqual(mockResponse.data);
      expect(result.data).toEqual([{ slug: 'test' }]);
      expect(result.meta.count).toBe(1);
    });

    it('should handle axios interceptor unwrapped response', async () => {
      const mockResponse = {
        data: [{ slug: 'test' }],
        meta: { count: 1 },
      };
      instance.get.mockResolvedValue(mockResponse);

      const result = await fetchPathways({});

      expect(result).toEqual({
        data: mockResponse.data,
        meta: mockResponse.meta,
      });
    });

    it('should handle Cypress array-only response', async () => {
      const mockResponse = {
        data: [{ slug: 'test1' }, { slug: 'test2' }],
      };
      instance.get.mockResolvedValue(mockResponse);

      const result = await fetchPathways({});

      expect(result).toEqual({
        data: mockResponse.data,
        meta: { count: 2 },
      });
    });

    it('should skip undefined and null parameters', async () => {
      const mockResponse = {
        data: { data: [], meta: { count: 0 } },
      };
      instance.get.mockResolvedValue(mockResponse);

      await fetchPathways({
        offset: 0,
        nullParam: null,
        undefinedParam: undefined,
      });

      const calledUrl = instance.get.mock.calls[0][0];
      expect(calledUrl).toContain('offset=0');
      expect(calledUrl).not.toContain('nullParam');
      expect(calledUrl).not.toContain('undefinedParam');
    });

    it('should handle sort parameter', async () => {
      const mockResponse = {
        data: { data: [], meta: { count: 0 } },
      };
      instance.get.mockResolvedValue(mockResponse);

      await fetchPathways({ sort: '-impacted_systems_count' });

      expect(instance.get).toHaveBeenCalledWith(
        expect.stringContaining('sort=-impacted_systems_count'),
      );
    });

    it('should handle unexpected response format with fallback', async () => {
      const mockResponse = {
        data: { unexpected: 'format' },
      };
      instance.get.mockResolvedValue(mockResponse);

      const result = await fetchPathways({});

      expect(result).toEqual({ unexpected: 'format' });
    });
  });

  describe('fetchPathway', () => {
    it('should fetch a single pathway by slug', async () => {
      const mockResponse = {
        data: { slug: 'test-pathway', name: 'Test Pathway' },
      };
      instance.get.mockResolvedValue(mockResponse);

      const result = await fetchPathway('test-pathway');

      expect(instance.get).toHaveBeenCalledWith(
        expect.stringContaining('/pathway/test-pathway/'),
      );
      expect(result).toEqual(mockResponse.data);
    });

    it('should handle options parameter', async () => {
      const mockResponse = {
        data: { slug: 'test-pathway' },
      };
      instance.get.mockResolvedValue(mockResponse);

      await fetchPathway('test-pathway', { include_rules: 'true' });

      expect(instance.get).toHaveBeenCalledWith(
        expect.stringContaining('include_rules=true'),
      );
    });
  });
});
