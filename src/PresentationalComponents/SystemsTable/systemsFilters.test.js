describe('SystemsTable Filter Array Safety', () => {
  const ensureArray = (value) =>
    Array.isArray(value) ? value : value ? [String(value)] : [];

  describe('Hits Filter', () => {
    it('should convert string to array', () => {
      const filters = { hits: 'yes' };
      const value = ensureArray(filters.hits);
      expect(value).toEqual(['yes']);
    });

    it('should handle undefined', () => {
      const filters = {};
      const value = ensureArray(filters.hits);
      expect(value).toEqual([]);
    });

    it('should preserve array', () => {
      const filters = { hits: ['yes', 'no'] };
      const value = ensureArray(filters.hits);
      expect(value).toEqual(['yes', 'no']);
    });

    it('should safely handle hits filter value', () => {
      const filters = { hits: 'yes' };
      const value = Array.isArray(filters.hits)
        ? filters.hits
        : filters.hits
          ? [String(filters.hits)]
          : [];
      expect(value).toEqual(['yes']);
    });
  });

  describe('Incident Filter', () => {
    it('should convert string to array', () => {
      const filters = { incident: 'true' };
      const value = ensureArray(filters.incident);
      expect(value).toEqual(['true']);
    });

    it('should convert boolean to array', () => {
      const filters = { incident: true };
      const value = ensureArray(filters.incident);
      expect(value).toEqual(['true']);
    });

    it('should handle undefined', () => {
      const filters = {};
      const value = ensureArray(filters.incident);
      expect(value).toEqual([]);
    });

    it('should preserve array', () => {
      const filters = { incident: ['true', 'false'] };
      const value = ensureArray(filters.incident);
      expect(value).toEqual(['true', 'false']);
    });

    it('should safely handle incident filter value', () => {
      const filters = { incident: 'true' };
      const value = Array.isArray(filters.incident)
        ? filters.incident
        : filters.incident
          ? [String(filters.incident)]
          : [];
      expect(value).toEqual(['true']);
    });
  });

  describe('Multiple Filters', () => {
    it('should handle both hits and incident as strings', () => {
      const filters = { hits: 'yes', incident: 'true' };
      const hitsValue = ensureArray(filters.hits);
      const incidentValue = ensureArray(filters.incident);
      expect(hitsValue).toEqual(['yes']);
      expect(incidentValue).toEqual(['true']);
    });

    it('should handle mixed types', () => {
      const filters = { hits: ['yes'], incident: 'true' };
      const hitsValue = ensureArray(filters.hits);
      const incidentValue = ensureArray(filters.incident);
      expect(hitsValue).toEqual(['yes']);
      expect(incidentValue).toEqual(['true']);
    });
  });
});
