import {
  nameFilter,
  categoryFilter,
  incidentFilter,
  rebootFilter,
} from './Filters';

describe('PathwaysTable Filters', () => {
  describe('nameFilter', () => {
    it('should serialize text value from array', () => {
      const result = nameFilter.filterSerialiser(['test']);
      expect(result).toEqual({ text: 'test' });
    });

    it('should serialize text value from string', () => {
      const result = nameFilter.filterSerialiser('test');
      expect(result).toEqual({ text: 'test' });
    });

    it('should return empty object for empty array', () => {
      const result = nameFilter.filterSerialiser([]);
      expect(result).toEqual({});
    });

    it('should return empty object for null/undefined', () => {
      expect(nameFilter.filterSerialiser(null)).toEqual({});
      expect(nameFilter.filterSerialiser(undefined)).toEqual({});
    });
  });

  describe('categoryFilter', () => {
    it('should serialize category array', () => {
      const result = categoryFilter.filterSerialiser(['1', '2']);
      expect(result).toEqual({ category: ['1', '2'] });
    });

    it('should return empty object for empty array', () => {
      const result = categoryFilter.filterSerialiser([]);
      expect(result).toEqual({});
    });

    it('should handle non-array values', () => {
      const result = categoryFilter.filterSerialiser('1');
      expect(result).toEqual({});
    });
  });

  describe('incidentFilter', () => {
    it('should serialize incident array with true (camelCase for insights-client)', () => {
      const result = incidentFilter.filterSerialiser(['true']);
      expect(result).toEqual({ hasIncident: 'true' });
    });

    it('should serialize incident array with false (camelCase for insights-client)', () => {
      const result = incidentFilter.filterSerialiser(['false']);
      expect(result).toEqual({ hasIncident: 'false' });
    });

    it('should return empty object for empty array', () => {
      const result = incidentFilter.filterSerialiser([]);
      expect(result).toEqual({});
    });

    it('should handle non-array values', () => {
      const result = incidentFilter.filterSerialiser('true');
      expect(result).toEqual({});
    });

    it('should extract first element from array', () => {
      const result = incidentFilter.filterSerialiser(['true', 'false']);
      expect(result).toEqual({ hasIncident: 'true' });
    });
  });

  describe('rebootFilter', () => {
    it('should serialize reboot array with true (camelCase for insights-client)', () => {
      const result = rebootFilter.filterSerialiser(['true']);
      expect(result).toEqual({ rebootRequired: 'true' });
    });

    it('should serialize reboot array with false (camelCase for insights-client)', () => {
      const result = rebootFilter.filterSerialiser(['false']);
      expect(result).toEqual({ rebootRequired: 'false' });
    });

    it('should return empty object for empty array', () => {
      const result = rebootFilter.filterSerialiser([]);
      expect(result).toEqual({});
    });

    it('should handle non-array values', () => {
      const result = rebootFilter.filterSerialiser('true');
      expect(result).toEqual({});
    });

    it('should extract first element from array', () => {
      const result = rebootFilter.filterSerialiser(['false', 'true']);
      expect(result).toEqual({ rebootRequired: 'false' });
    });
  });
});
