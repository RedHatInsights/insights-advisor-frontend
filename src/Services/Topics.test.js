import {
  Topics,
  useGetTopicsQuery,
  useGetTopicQuery,
  useGetTopicsAdminQuery,
} from './Topics';

describe('Topics Service', () => {
  describe('API structure', () => {
    it('should export Topics API', () => {
      expect(Topics).toBeDefined();
      expect(Topics.reducerPath).toBe('topics');
    });

    it('should have correct reducer path', () => {
      expect(Topics.reducerPath).toBe('topics');
    });

    it('should export useGetTopicsQuery hook', () => {
      expect(useGetTopicsQuery).toBeDefined();
      expect(typeof useGetTopicsQuery).toBe('function');
    });

    it('should export useGetTopicQuery hook', () => {
      expect(useGetTopicQuery).toBeDefined();
      expect(typeof useGetTopicQuery).toBe('function');
    });

    it('should export useGetTopicsAdminQuery hook', () => {
      expect(useGetTopicsAdminQuery).toBeDefined();
      expect(typeof useGetTopicsAdminQuery).toBe('function');
    });
  });

  describe('endpoint configuration', () => {
    it('should have getTopics endpoint', () => {
      const endpoints = Topics.endpoints;
      expect(endpoints.getTopics).toBeDefined();
      expect(typeof endpoints.getTopics).toBe('object');
    });

    it('should have getTopic endpoint', () => {
      const endpoints = Topics.endpoints;
      expect(endpoints.getTopic).toBeDefined();
      expect(typeof endpoints.getTopic).toBe('object');
    });

    it('should have getTopicsAdmin endpoint', () => {
      const endpoints = Topics.endpoints;
      expect(endpoints.getTopicsAdmin).toBeDefined();
      expect(typeof endpoints.getTopicsAdmin).toBe('object');
    });
  });
});
