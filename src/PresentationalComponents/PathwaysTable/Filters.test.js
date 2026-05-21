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
    it('should serialize incident array with true', () => {
      const result = incidentFilter.filterSerialiser(['true']);
      expect(result).toEqual({ has_incident: ['true'] });
    });

    it('should serialize incident array with false', () => {
      const result = incidentFilter.filterSerialiser(['false']);
      expect(result).toEqual({ has_incident: ['false'] });
    });

    it('should return empty object for empty array', () => {
      const result = incidentFilter.filterSerialiser([]);
      expect(result).toEqual({});
    });

    it('should handle non-array values', () => {
      const result = incidentFilter.filterSerialiser('true');
      expect(result).toEqual({});
    });
  });

  describe('rebootFilter', () => {
    it('should serialize reboot array with true', () => {
      const result = rebootFilter.filterSerialiser(['true']);
      expect(result).toEqual({ reboot_required: ['true'] });
    });

    it('should serialize reboot array with false', () => {
      const result = rebootFilter.filterSerialiser(['false']);
      expect(result).toEqual({ reboot_required: ['false'] });
    });

    it('should return empty object for empty array', () => {
      const result = rebootFilter.filterSerialiser([]);
      expect(result).toEqual({});
    });

    it('should handle non-array values', () => {
      const result = rebootFilter.filterSerialiser('true');
      expect(result).toEqual({});
    });
  });
});
