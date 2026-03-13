import { conditionalFilterType } from '@redhat-cloud-services/frontend-components/ConditionalFilter';

describe('RulesTable Filters - Array Safety Fix', () => {
  const ensureArray = (value) => {
    return Array.isArray(value) ? value : value ? [String(value)] : [];
  };

  describe('Bug Scenario: URL params as strings', () => {
    it('should convert incident string to array with value', () => {
      const incident = 'true';
      const safeValue = ensureArray(incident);

      expect(Array.isArray(safeValue)).toBe(true);
      expect(safeValue).toEqual(['true']);
    });

    it('should convert has_playbook string to array with value', () => {
      const has_playbook = 'true';
      const safeValue = ensureArray(has_playbook);

      expect(Array.isArray(safeValue)).toBe(true);
      expect(safeValue).toEqual(['true']);
    });

    it('should convert category string to array with value', () => {
      const category = 'security';
      const safeValue = ensureArray(category);

      expect(Array.isArray(safeValue)).toBe(true);
      expect(safeValue).toEqual(['security']);
    });

    it('should convert total_risk string to array with value', () => {
      const total_risk = '4';
      const safeValue = ensureArray(total_risk);

      expect(Array.isArray(safeValue)).toBe(true);
      expect(safeValue).toEqual(['4']);
    });
  });

  describe('Edge Cases', () => {
    it('should convert boolean to array with stringified value', () => {
      const incident = true;
      const safeValue = ensureArray(incident);

      expect(Array.isArray(safeValue)).toBe(true);
      expect(safeValue).toEqual(['true']);
    });

    it('should convert number to array with stringified value', () => {
      const total_risk = 4;
      const safeValue = ensureArray(total_risk);

      expect(Array.isArray(safeValue)).toBe(true);
      expect(safeValue).toEqual(['4']);
    });

    it('should convert undefined to empty array', () => {
      const incident = undefined;
      const safeValue = ensureArray(incident);

      expect(Array.isArray(safeValue)).toBe(true);
      expect(safeValue).toEqual([]);
    });

    it('should convert null to empty array', () => {
      const incident = null;
      const safeValue = ensureArray(incident);

      expect(Array.isArray(safeValue)).toBe(true);
      expect(safeValue).toEqual([]);
    });

    it('should convert empty string to empty array', () => {
      const incident = '';
      const safeValue = ensureArray(incident);

      expect(Array.isArray(safeValue)).toBe(true);
      expect(safeValue).toEqual([]);
    });

    it('should convert object to array with stringified value', () => {
      const incident = { value: 'true' };
      const safeValue = ensureArray(incident);

      expect(Array.isArray(safeValue)).toBe(true);
      expect(safeValue).toEqual(['[object Object]']);
    });
  });

  describe('Correct Scenarios: Arrays remain arrays', () => {
    it('should keep single-value array unchanged', () => {
      const incident = ['true'];
      const safeValue = ensureArray(incident);

      expect(Array.isArray(safeValue)).toBe(true);
      expect(safeValue).toEqual(['true']);
    });

    it('should keep multi-value array unchanged', () => {
      const total_risk = ['3', '4'];
      const safeValue = ensureArray(total_risk);

      expect(Array.isArray(safeValue)).toBe(true);
      expect(safeValue).toEqual(['3', '4']);
    });

    it('should keep empty array unchanged', () => {
      const incident = [];
      const safeValue = ensureArray(incident);

      expect(Array.isArray(safeValue)).toBe(true);
      expect(safeValue).toEqual([]);
    });

    it('should keep large array unchanged', () => {
      const largeArray = ['1', '2', '3', '4', '5'];
      const safeValue = ensureArray(largeArray);

      expect(Array.isArray(safeValue)).toBe(true);
      expect(safeValue).toEqual(['1', '2', '3', '4', '5']);
    });
  });

  describe('Real-world URL param scenarios', () => {
    it('should handle incident=true from URL', () => {
      const filters = { incident: 'true' };
      const safeIncident = ensureArray(filters.incident);

      expect(safeIncident).toEqual(['true']);
    });

    it('should handle incident=true&incident=false from URL', () => {
      const filters = { incident: ['true', 'false'] };
      const safeIncident = ensureArray(filters.incident);

      expect(safeIncident).toEqual(['true', 'false']);
    });

    it('should handle mixed filter types from URL', () => {
      const filters = {
        incident: 'true',
        has_playbook: ['true'],
        category: undefined,
        total_risk: ['3', '4'],
      };

      expect(ensureArray(filters.incident)).toEqual(['true']);
      expect(ensureArray(filters.has_playbook)).toEqual(['true']);
      expect(ensureArray(filters.category)).toEqual([]);
      expect(ensureArray(filters.total_risk)).toEqual(['3', '4']);
    });
  });

  describe('Filter value usage in CheckboxFilter', () => {
    it('should allow .includes() on ensured array values', () => {
      const filters = { incident: 'true' };
      const safeValue = ensureArray(filters.incident);

      expect(() => safeValue.includes('true')).not.toThrow();
      expect(safeValue.includes('true')).toBe(true);
    });

    it('should allow .map() on ensured array values', () => {
      const filters = { incident: 'true' };
      const safeValue = ensureArray(filters.incident);

      expect(() => safeValue.map((v) => v)).not.toThrow();
      expect(safeValue.map((v) => v)).toEqual(['true']);
    });

    it('should allow .filter() on ensured array values', () => {
      const filters = { total_risk: '4' };
      const safeValue = ensureArray(filters.total_risk);

      expect(() => safeValue.filter((v) => v === '4')).not.toThrow();
      expect(safeValue.filter((v) => v === '4')).toEqual(['4']);
    });

    it('should support array spread operator', () => {
      const filters = { incident: true };
      const safeValue = ensureArray(filters.incident);

      expect(() => [...safeValue]).not.toThrow();
      expect([...safeValue]).toEqual(['true']);
    });
  });

  describe('Integration with filterConfigItems structure', () => {
    it('should create valid checkbox filter config with string value', () => {
      const filters = { incident: 'true' };

      const filterConfig = {
        type: conditionalFilterType.checkbox,
        filterValues: {
          value: ensureArray(filters.incident),
          items: [
            { label: 'Incident', value: 'true' },
            { label: 'Non-incident', value: 'false' },
          ],
        },
      };

      expect(Array.isArray(filterConfig.filterValues.value)).toBe(true);
      expect(filterConfig.filterValues.value).toEqual(['true']);
    });

    it('should create valid checkbox filter config with array value', () => {
      const filters = { incident: ['true'] };

      const filterConfig = {
        type: conditionalFilterType.checkbox,
        filterValues: {
          value: ensureArray(filters.incident),
          items: [
            { label: 'Incident', value: 'true' },
            { label: 'Non-incident', value: 'false' },
          ],
        },
      };

      expect(Array.isArray(filterConfig.filterValues.value)).toBe(true);
      expect(filterConfig.filterValues.value).toEqual(['true']);
    });
  });
});
