import {
  Pathways,
  useGetPathwaysQuery,
  useGetPathwayQuery,
  useGetPathwayRulesQuery,
  useGetPathwaySystemsQuery,
} from './Pathways';

describe('Pathways Service', () => {
  describe('API structure', () => {
    it('should export Pathways API', () => {
      expect(Pathways).toBeDefined();
      expect(Pathways.reducerPath).toBe('pathways');
    });

    it('should have correct reducer path', () => {
      expect(Pathways.reducerPath).toBe('pathways');
    });

    it('should export useGetPathwaysQuery hook', () => {
      expect(useGetPathwaysQuery).toBeDefined();
      expect(typeof useGetPathwaysQuery).toBe('function');
    });

    it('should export useGetPathwayQuery hook', () => {
      expect(useGetPathwayQuery).toBeDefined();
      expect(typeof useGetPathwayQuery).toBe('function');
    });

    it('should export useGetPathwayRulesQuery hook', () => {
      expect(useGetPathwayRulesQuery).toBeDefined();
      expect(typeof useGetPathwayRulesQuery).toBe('function');
    });

    it('should export useGetPathwaySystemsQuery hook', () => {
      expect(useGetPathwaySystemsQuery).toBeDefined();
      expect(typeof useGetPathwaySystemsQuery).toBe('function');
    });
  });

  describe('endpoint configuration', () => {
    it('should have getPathways endpoint', () => {
      const endpoints = Pathways.endpoints;
      expect(endpoints.getPathways).toBeDefined();
      expect(typeof endpoints.getPathways).toBe('object');
    });

    it('should have getPathway endpoint', () => {
      const endpoints = Pathways.endpoints;
      expect(endpoints.getPathway).toBeDefined();
      expect(typeof endpoints.getPathway).toBe('object');
    });

    it('should have getPathwayRules endpoint', () => {
      const endpoints = Pathways.endpoints;
      expect(endpoints.getPathwayRules).toBeDefined();
      expect(typeof endpoints.getPathwayRules).toBe('object');
    });

    it('should have getPathwaySystems endpoint', () => {
      const endpoints = Pathways.endpoints;
      expect(endpoints.getPathwaySystems).toBeDefined();
      expect(typeof endpoints.getPathwaySystems).toBe('object');
    });
  });
});
