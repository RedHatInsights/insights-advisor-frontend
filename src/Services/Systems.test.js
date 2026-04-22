import { Systems, useGetSystemsQuery, useGetSystemQuery } from './Systems';

describe('Systems Service', () => {
  describe('API structure', () => {
    it('should export Systems API', () => {
      expect(Systems).toBeDefined();
      expect(Systems.reducerPath).toBe('systems');
    });

    it('should have correct reducer path', () => {
      expect(Systems.reducerPath).toBe('systems');
    });

    it('should export useGetSystemsQuery hook', () => {
      expect(useGetSystemsQuery).toBeDefined();
      expect(typeof useGetSystemsQuery).toBe('function');
    });

    it('should export useGetSystemQuery hook', () => {
      expect(useGetSystemQuery).toBeDefined();
      expect(typeof useGetSystemQuery).toBe('function');
    });
  });

  describe('endpoint configuration', () => {
    it('should have getSystems endpoint', () => {
      const endpoints = Systems.endpoints;
      expect(endpoints.getSystems).toBeDefined();
      expect(typeof endpoints.getSystems).toBe('object');
    });

    it('should have getSystem endpoint', () => {
      const endpoints = Systems.endpoints;
      expect(endpoints.getSystem).toBeDefined();
      expect(typeof endpoints.getSystem).toBe('object');
    });
  });
});
