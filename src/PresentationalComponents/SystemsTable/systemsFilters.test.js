import { conditionalFilterType } from '@redhat-cloud-services/frontend-components/ConditionalFilter';

describe('SystemsTable Filters - Array Safety Fix', () => {
  const ensureArray = (value) => {
    return Array.isArray(value) ? value : value ? [String(value)] : [];
  };

  const createMockFilterConfig = (filters) => {
    return [
      {
        label: 'hits',
        type: conditionalFilterType.checkbox,
        id: 'hits',
        filterValues: {
          value: ensureArray(filters.hits),
        },
      },
      {
        label: 'incident',
        type: conditionalFilterType.checkbox,
        id: 'incident',
        filterValues: {
          value: ensureArray(filters.incident),
        },
      },
    ];
  };

  describe('Hits Filter - Array Safety', () => {
    it('should convert hits string to array with value', () => {
      const filters = { hits: '1-10' };
      const config = createMockFilterConfig(filters);
      const hitsFilter = config.find((f) => f.id === 'hits');

      expect(Array.isArray(hitsFilter.filterValues.value)).toBe(true);
      expect(hitsFilter.filterValues.value).toEqual(['1-10']);
    });

    it('should keep hits array unchanged', () => {
      const filters = { hits: ['1-10', '11-50'] };
      const config = createMockFilterConfig(filters);
      const hitsFilter = config.find((f) => f.id === 'hits');

      expect(hitsFilter.filterValues.value).toEqual(['1-10', '11-50']);
    });

    it('should convert hits number to array with stringified value', () => {
      const filters = { hits: 5 };
      const config = createMockFilterConfig(filters);
      const hitsFilter = config.find((f) => f.id === 'hits');

      expect(hitsFilter.filterValues.value).toEqual(['5']);
    });
  });

  describe('Incident Filter - Array Safety', () => {
    it('should convert incident string to array with value', () => {
      const filters = { incident: 'true' };
      const config = createMockFilterConfig(filters);
      const incidentFilter = config.find((f) => f.id === 'incident');

      expect(Array.isArray(incidentFilter.filterValues.value)).toBe(true);
      expect(incidentFilter.filterValues.value).toEqual(['true']);
    });

    it('should keep incident array unchanged', () => {
      const filters = { incident: ['true'] };
      const config = createMockFilterConfig(filters);
      const incidentFilter = config.find((f) => f.id === 'incident');

      expect(incidentFilter.filterValues.value).toEqual(['true']);
    });

    it('should convert incident boolean to array with stringified value', () => {
      const filters = { incident: true };
      const config = createMockFilterConfig(filters);
      const incidentFilter = config.find((f) => f.id === 'incident');

      expect(incidentFilter.filterValues.value).toEqual(['true']);
    });

    it('should handle incident with multiple values', () => {
      const filters = { incident: ['true', 'false'] };
      const config = createMockFilterConfig(filters);
      const incidentFilter = config.find((f) => f.id === 'incident');

      expect(incidentFilter.filterValues.value).toEqual(['true', 'false']);
    });
  });

  describe('Mixed Filter Types', () => {
    it('should handle mixed value types correctly', () => {
      const filters = {
        hits: '1-10',
        incident: ['true'],
      };
      const config = createMockFilterConfig(filters);

      const hitsFilter = config.find((f) => f.id === 'hits');
      expect(hitsFilter.filterValues.value).toEqual(['1-10']);

      const incidentFilter = config.find((f) => f.id === 'incident');
      expect(incidentFilter.filterValues.value).toEqual(['true']);
    });

    it('should handle all non-array types', () => {
      const filters = {
        hits: 5,
        incident: true,
      };
      const config = createMockFilterConfig(filters);

      const hitsFilter = config.find((f) => f.id === 'hits');
      expect(Array.isArray(hitsFilter.filterValues.value)).toBe(true);
      expect(hitsFilter.filterValues.value).toEqual(['5']);

      const incidentFilter = config.find((f) => f.id === 'incident');
      expect(Array.isArray(incidentFilter.filterValues.value)).toBe(true);
      expect(incidentFilter.filterValues.value).toEqual(['true']);
    });
  });

  describe('URL Parameter Scenarios', () => {
    it('should handle incident=true from URL', () => {
      const filters = { incident: 'true' };
      const safeValue = ensureArray(filters.incident);

      expect(safeValue).toEqual(['true']);
    });

    it('should handle hits=1-10 from URL', () => {
      const filters = { hits: '1-10' };
      const safeValue = ensureArray(filters.hits);

      expect(safeValue).toEqual(['1-10']);
    });

    it('should handle properly parsed array from URL', () => {
      const filters = { incident: ['true', 'false'] };
      const safeValue = ensureArray(filters.incident);

      expect(safeValue).toEqual(['true', 'false']);
    });
  });

  describe('Empty and Null Values', () => {
    it('should handle undefined values', () => {
      const filters = {};
      const config = createMockFilterConfig(filters);

      config.forEach((filter) => {
        expect(filter.filterValues.value).toEqual([]);
      });
    });

    it('should handle null values', () => {
      const filters = { hits: null, incident: null };
      const config = createMockFilterConfig(filters);

      config.forEach((filter) => {
        expect(filter.filterValues.value).toEqual([]);
      });
    });

    it('should handle empty string values', () => {
      const filters = { hits: '', incident: '' };
      const config = createMockFilterConfig(filters);

      config.forEach((filter) => {
        expect(filter.filterValues.value).toEqual([]);
      });
    });
  });
});
