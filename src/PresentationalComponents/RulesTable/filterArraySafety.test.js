const ensureArray = (value) =>
  Array.isArray(value) ? value : value ? [String(value)] : [];

describe('Filter Array Safety', () => {
  describe('Bug Scenarios', () => {
    it('should convert incident string to array with value', () => {
      const incident = 'true';
      const safeValue = ensureArray(incident);
      expect(safeValue).toEqual(['true']);
    });

    it('should convert has_playbook boolean to array with value', () => {
      const hasPlaybook = true;
      const safeValue = ensureArray(hasPlaybook);
      expect(safeValue).toEqual(['true']);
    });

    it('should convert category number to array with value', () => {
      const category = 2;
      const safeValue = ensureArray(category);
      expect(safeValue).toEqual(['2']);
    });
  });

  describe('Edge Cases', () => {
    it('should handle null value', () => {
      const safeValue = ensureArray(null);
      expect(safeValue).toEqual([]);
    });

    it('should handle undefined value', () => {
      const safeValue = ensureArray(undefined);
      expect(safeValue).toEqual([]);
    });

    it('should handle empty string', () => {
      const safeValue = ensureArray('');
      expect(safeValue).toEqual([]);
    });

    it('should handle zero', () => {
      const safeValue = ensureArray(0);
      expect(safeValue).toEqual([]);
    });

    it('should handle false', () => {
      const safeValue = ensureArray(false);
      expect(safeValue).toEqual([]);
    });
  });

  describe('Array Values', () => {
    it('should preserve array with single value', () => {
      const value = ['true'];
      const safeValue = ensureArray(value);
      expect(safeValue).toEqual(['true']);
    });

    it('should preserve array with multiple values', () => {
      const value = ['1', '2', '3'];
      const safeValue = ensureArray(value);
      expect(safeValue).toEqual(['1', '2', '3']);
    });

    it('should preserve empty array', () => {
      const value = [];
      const safeValue = ensureArray(value);
      expect(safeValue).toEqual([]);
    });
  });

  describe('URL Parameter Handling', () => {
    it('should handle incident=true from URL', () => {
      const filters = { incident: true };
      const safeValue = ensureArray(filters.incident);
      expect(safeValue).toEqual(['true']);
    });

    it('should handle has_playbook=false from URL', () => {
      const filters = { has_playbook: false };
      const safeValue = ensureArray(filters.has_playbook);
      expect(safeValue).toEqual([]);
    });

    it('should handle category=2 from URL', () => {
      const filters = { category: 2 };
      const safeValue = ensureArray(filters.category);
      expect(safeValue).toEqual(['2']);
    });

    it('should handle total_risk=4 from URL', () => {
      const filters = { total_risk: '4' };
      const safeValue = ensureArray(filters.total_risk);
      expect(safeValue).toEqual(['4']);
    });
  });

  describe('CheckboxFilter Usage', () => {
    it('should safely handle string value in incident filter', () => {
      const filters = { incident: 'true' };
      const value = Array.isArray(filters.incident)
        ? filters.incident
        : filters.incident
          ? [String(filters.incident)]
          : [];
      expect(value).toEqual(['true']);
    });

    it('should safely handle boolean value in has_playbook filter', () => {
      const filters = { has_playbook: true };
      const value = Array.isArray(filters.has_playbook)
        ? filters.has_playbook
        : filters.has_playbook
          ? [String(filters.has_playbook)]
          : [];
      expect(value).toEqual(['true']);
    });

    it('should safely handle number value in category filter', () => {
      const filters = { category: 2 };
      const value = Array.isArray(filters.category)
        ? filters.category
        : filters.category
          ? [String(filters.category)]
          : [];
      expect(value).toEqual(['2']);
    });

    it('should safely handle undefined value', () => {
      const filters = {};
      const value = Array.isArray(filters.incident)
        ? filters.incident
        : filters.incident
          ? [String(filters.incident)]
          : [];
      expect(value).toEqual([]);
    });

    it('should preserve array value', () => {
      const filters = { incident: ['true', 'false'] };
      const value = Array.isArray(filters.incident)
        ? filters.incident
        : filters.incident
          ? [String(filters.incident)]
          : [];
      expect(value).toEqual(['true', 'false']);
    });
  });
});
