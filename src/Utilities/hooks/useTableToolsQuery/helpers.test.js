import {
  defaultCompileResult,
  compileTotalResult,
  hasRequiredParams,
  fetchResult,
  combineParamsWithTableState,
} from './helpers.js';

describe('useTableToolsQuery helpers', () => {
  describe('defaultCompileResult', () => {
    it('returns correct data with meta', () => {
      const result = defaultCompileResult({
        data: [1, 2, 3],
        meta: { count: 3 },
      });

      expect(result).toEqual({
        data: [1, 2, 3],
        meta: { count: 3, total: 3 },
      });
    });

    it('converts count to total for bastilian-tabletools', () => {
      const result = defaultCompileResult(
        { data: [{ id: 1 }], meta: { count: 120 } },
        {},
      );

      expect(result.meta.total).toBe(120);
      expect(result.meta.count).toBe(120);
    });

    it('merges params into meta', () => {
      const result = defaultCompileResult(
        { data: [1, 2, 3], meta: { count: 3 } },
        { offset: 20, limit: 20 },
      );

      expect(result).toEqual({
        data: [1, 2, 3],
        meta: { offset: 20, limit: 20, count: 3, total: 3 },
      });
    });

    it('handles missing meta', () => {
      const result = defaultCompileResult({ data: [1, 2, 3] }, {});

      expect(result).toEqual({
        data: [1, 2, 3],
        meta: { total: undefined },
      });
    });

    it('handles response without data property', () => {
      const result = defaultCompileResult([1, 2, 3], {});

      expect(result).toEqual({
        data: [1, 2, 3],
        meta: { total: undefined },
      });
    });

    it('preserves other meta properties', () => {
      const result = defaultCompileResult(
        {
          data: [1, 2, 3],
          meta: { count: 3, other: 'value' },
        },
        {},
      );

      expect(result.meta.other).toBe('value');
      expect(result.meta.total).toBe(3);
    });
  });

  describe('compileTotalResult', () => {
    it('returns total from meta', () => {
      const result = compileTotalResult({ meta: { total: 150 } });
      expect(result).toBe(150);
    });

    it('handles missing meta', () => {
      const result = compileTotalResult({});
      expect(result).toBeUndefined();
    });

    it('handles undefined input', () => {
      const result = compileTotalResult(undefined);
      expect(result).toBeUndefined();
    });
  });

  describe('hasRequiredParams', () => {
    it('returns true when no required params', () => {
      const result = hasRequiredParams(null, { param1: 'value1' });
      expect(result).toBe(true);
    });

    it('returns true when undefined required params', () => {
      const result = hasRequiredParams(undefined, { param1: 'value1' });
      expect(result).toBe(true);
    });

    it('does not log error when all params are present', () => {
      console.error = jest.fn();
      hasRequiredParams(['param1', 'param2'], {
        param1: 'value1',
        param2: 'value2',
      });
      expect(console.error).not.toHaveBeenCalled();
    });

    it('handles a single string for requiredParams', () => {
      console.error = jest.fn();
      hasRequiredParams('param1', {});
      expect(console.error).toHaveBeenCalledWith(
        "Missing required parameter: 'param1'",
      );
    });

    it('logs error when missing param', () => {
      console.error = jest.fn();
      hasRequiredParams(['param1', 'param2'], { param1: 'value1' });
      expect(console.error).toHaveBeenCalledWith(
        "Missing required parameter: 'param2'",
      );
    });

    it('handles empty params object', () => {
      console.error = jest.fn();
      hasRequiredParams(['required'], {});
      expect(console.error).toHaveBeenCalledWith(
        "Missing required parameter: 'required'",
      );
    });
  });

  describe('fetchResult', () => {
    it('calls fn with converted params and compiles result', async () => {
      const mockApiCall = jest.fn().mockResolvedValue({
        data: [{ id: 1 }],
        meta: { count: 1 },
      });
      const mockConvertToArray = jest.fn((params) => [params]);
      const mockCompileResult = jest.fn((result) => result);
      const params = { offset: 0, limit: 20, hasIncident: 'true' };

      await fetchResult(
        mockApiCall,
        params,
        mockConvertToArray,
        mockCompileResult,
      );

      expect(mockConvertToArray).toHaveBeenCalledWith(params);
      expect(mockApiCall).toHaveBeenCalledWith(params);
      expect(mockCompileResult).toHaveBeenCalledWith(
        { data: [{ id: 1 }], meta: { count: 1 } },
        params,
      );
    });

    it('converts params to array for insights-client', async () => {
      const mockApiCall = jest.fn().mockResolvedValue({ data: [] });
      const convertToArray = (params) => [params];
      const params = { offset: 0, limit: 20 };

      await fetchResult(
        mockApiCall,
        params,
        convertToArray,
        defaultCompileResult,
      );

      expect(mockApiCall).toHaveBeenCalledWith(params);
    });
  });

  describe('combineParamsWithTableState', () => {
    it('flattens filters to root level', () => {
      const tableStateParams = {
        offset: 0,
        limit: 20,
        filters: { hasIncident: 'true', category: ['1'] },
      };

      const result = combineParamsWithTableState(tableStateParams, {});

      expect(result).toEqual({
        offset: 0,
        limit: 20,
        hasIncident: 'true',
        category: ['1'],
      });
    });

    it('merges filter objects (not strings like Compliance)', () => {
      const tableStateParams = {
        filters: { hasIncident: 'true' },
      };
      const additionalParams = {
        filters: { tags: 'prod,test' },
      };

      const result = combineParamsWithTableState(
        tableStateParams,
        additionalParams,
      );

      expect(result).toEqual({
        hasIncident: 'true',
        tags: 'prod,test',
      });
    });

    it('handles only tableStateParams', () => {
      const tableStateParams = {
        filters: { hasIncident: 'true' },
        offset: 0,
      };

      const result = combineParamsWithTableState(tableStateParams, {});

      expect(result).toEqual({
        hasIncident: 'true',
        offset: 0,
      });
    });

    it('handles only additionalParams', () => {
      const additionalParams = {
        filters: { tags: 'prod' },
      };

      const result = combineParamsWithTableState({}, additionalParams);

      expect(result).toEqual({
        tags: 'prod',
      });
    });

    it('handles both params being empty', () => {
      const result = combineParamsWithTableState({}, {});
      expect(result).toEqual({});
    });

    it('handles undefined params', () => {
      const result = combineParamsWithTableState();
      expect(result).toEqual({});
    });

    it('handles null params', () => {
      const result = combineParamsWithTableState(null, null);
      expect(result).toEqual({});
    });

    it('merges non-filter params correctly', () => {
      const tableStateParams = {
        offset: 0,
        limit: 20,
        sort: '-name',
      };
      const additionalParams = {
        tags: 'tag1,tag2',
        SAP: true,
      };

      const result = combineParamsWithTableState(
        tableStateParams,
        additionalParams,
      );

      expect(result).toEqual({
        offset: 0,
        limit: 20,
        sort: '-name',
        tags: 'tag1,tag2',
        SAP: true,
      });
    });

    it('handles complex nested scenario with all params', () => {
      const tableStateParams = {
        offset: 20,
        limit: 50,
        sort: '-impacted_systems_count',
        filters: {
          category: ['1', '2'],
          hasIncident: 'true',
          text: 'security',
        },
      };
      const additionalParams = {
        tags: 'prod,security',
        SAP: true,
        filters: {
          rebootRequired: 'false',
        },
      };

      const result = combineParamsWithTableState(
        tableStateParams,
        additionalParams,
      );

      expect(result).toEqual({
        offset: 20,
        limit: 50,
        sort: '-impacted_systems_count',
        category: ['1', '2'],
        hasIncident: 'true',
        text: 'security',
        rebootRequired: 'false',
        tags: 'prod,security',
        SAP: true,
      });
    });

    it('additionalParams filters overwrite tableStateParams filters for same key', () => {
      const tableStateParams = {
        filters: { category: ['1'] },
      };
      const additionalParams = {
        filters: { category: ['2', '3'] },
      };

      const result = combineParamsWithTableState(
        tableStateParams,
        additionalParams,
      );

      expect(result.category).toEqual(['2', '3']);
    });

    it('does not nest pagination params', () => {
      const tableStateParams = {
        offset: 0,
        limit: 20,
      };

      const result = combineParamsWithTableState(tableStateParams, {});

      expect(result).toEqual({
        offset: 0,
        limit: 20,
      });
      expect(result).not.toHaveProperty('pagination');
    });
  });
});
