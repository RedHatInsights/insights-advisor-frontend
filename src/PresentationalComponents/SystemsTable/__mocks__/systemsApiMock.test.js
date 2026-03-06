import {
  createMockSystem,
  createMockSystems,
  createMockSystemsResponse,
  getSystemMaxRisk,
  filterSystems,
  sortSystems,
  paginateSystems,
  mockSystemsApiHandler,
  mockScenarios,
} from './systemsApiMock';

describe('systemsApiMock', () => {
  describe('createMockSystem', () => {
    it('creates a system with default values', () => {
      const system = createMockSystem();

      expect(system).toHaveProperty('system_uuid');
      expect(system).toHaveProperty('display_name');
      expect(system).toHaveProperty('critical_hits', 0);
      expect(system).toHaveProperty('important_hits', 0);
      expect(system).toHaveProperty('moderate_hits', 0);
      expect(system).toHaveProperty('low_hits', 0);
      expect(system).toHaveProperty('hits', 0);
      expect(system).toHaveProperty('rhel_version');
      expect(system).toHaveProperty('last_seen');
    });

    it('allows overriding default values', () => {
      const system = createMockSystem({
        display_name: 'custom-system',
        critical_hits: 5,
        low_hits: 2,
      });

      expect(system.display_name).toBe('custom-system');
      expect(system.critical_hits).toBe(5);
      expect(system.low_hits).toBe(2);
    });
  });

  describe('createMockSystems', () => {
    it('creates the requested number of systems', () => {
      const systems = createMockSystems(10);
      expect(systems).toHaveLength(10);
    });

    it('creates systems with varied risk levels', () => {
      const systems = createMockSystems(10);
      const riskLevels = systems.map((s) => getSystemMaxRisk(s));

      expect(new Set(riskLevels).size).toBeGreaterThan(1);
    });

    it('applies customizer function to each system', () => {
      const systems = createMockSystems(5, (sys) => ({
        ...sys,
        display_name: `custom-${sys.display_name}`,
      }));

      systems.forEach((sys) => {
        expect(sys.display_name).toContain('custom-');
      });
    });
  });

  describe('createMockSystemsResponse', () => {
    it('creates a response with proper structure', () => {
      const response = createMockSystemsResponse();

      expect(response).toHaveProperty('data');
      expect(response).toHaveProperty('links');
      expect(response).toHaveProperty('meta');
      expect(Array.isArray(response.data)).toBe(true);
      expect(response.links).toHaveProperty('first');
      expect(response.links).toHaveProperty('last');
      expect(response.meta).toHaveProperty('count');
    });

    it('generates pagination links', () => {
      const response = createMockSystemsResponse({
        total: 100,
        limit: 20,
        offset: 40,
      });

      expect(response.links.next).toContain('offset=60');
      expect(response.links.previous).toContain('offset=20');
      expect(response.meta.count).toBe(100);
    });

    it('handles first page', () => {
      const response = createMockSystemsResponse({
        offset: 0,
        limit: 20,
      });

      expect(response.links.previous).toBeNull();
      expect(response.links.next).not.toBeNull();
    });

    it('handles last page', () => {
      const response = createMockSystemsResponse({
        total: 50,
        limit: 20,
        offset: 40,
      });

      expect(response.links.next).toBeNull();
    });
  });

  describe('getSystemMaxRisk', () => {
    it('returns 4 for systems with critical hits', () => {
      const system = createMockSystem({
        critical_hits: 1,
        important_hits: 2,
        moderate_hits: 1,
        low_hits: 1,
      });

      expect(getSystemMaxRisk(system)).toBe(4);
    });

    it('returns 3 for systems with only important hits', () => {
      const system = createMockSystem({
        critical_hits: 0,
        important_hits: 2,
        moderate_hits: 1,
        low_hits: 1,
      });

      expect(getSystemMaxRisk(system)).toBe(3);
    });

    it('returns 2 for systems with only moderate hits', () => {
      const system = createMockSystem({
        critical_hits: 0,
        important_hits: 0,
        moderate_hits: 3,
        low_hits: 1,
      });

      expect(getSystemMaxRisk(system)).toBe(2);
    });

    it('returns 1 for systems with only low hits', () => {
      const system = createMockSystem({
        critical_hits: 0,
        important_hits: 0,
        moderate_hits: 0,
        low_hits: 2,
      });

      expect(getSystemMaxRisk(system)).toBe(1);
    });

    it('returns 0 for systems with no hits', () => {
      const system = createMockSystem({
        critical_hits: 0,
        important_hits: 0,
        moderate_hits: 0,
        low_hits: 0,
      });

      expect(getSystemMaxRisk(system)).toBe(0);
    });
  });

  describe('filterSystems', () => {
    const systems = [
      createMockSystem({
        display_name: 'prod-web-1',
        critical_hits: 2,
        important_hits: 1,
      }),
      createMockSystem({
        display_name: 'prod-db-1',
        important_hits: 3,
      }),
      createMockSystem({
        display_name: 'test-app-1',
        low_hits: 2,
      }),
      createMockSystem({
        display_name: 'test-app-2',
        incident_hits: 1,
      }),
    ];

    it('filters by display_name', () => {
      const filtered = filterSystems(systems, { display_name: 'prod' });
      expect(filtered).toHaveLength(2);
      filtered.forEach((sys) => {
        expect(sys.display_name).toContain('prod');
      });
    });

    it('filters by hits (risk level)', () => {
      const filtered = filterSystems(systems, { hits: ['1'] });
      expect(filtered).toHaveLength(1);
      filtered.forEach((sys) => {
        expect(getSystemMaxRisk(sys)).toBe(1);
      });
    });

    it('does not filter when hits includes "all"', () => {
      const filtered = filterSystems(systems, { hits: ['all'] });
      expect(filtered).toHaveLength(systems.length);
    });

    it('filters by incident', () => {
      const filtered = filterSystems(systems, { incident: 'true' });
      expect(filtered).toHaveLength(1);
      filtered.forEach((sys) => {
        expect(sys.incident_hits).toBeGreaterThan(0);
      });
    });

    it('filters non-incident systems', () => {
      const filtered = filterSystems(systems, { incident: 'false' });
      expect(filtered).toHaveLength(3);
      filtered.forEach((sys) => {
        expect(sys.incident_hits).toBe(0);
      });
    });
  });

  describe('sortSystems', () => {
    const systems = [
      createMockSystem({
        display_name: 'beta',
        hits: 5,
        last_seen: '2026-03-01T10:00:00.000Z',
      }),
      createMockSystem({
        display_name: 'alpha',
        hits: 10,
        last_seen: '2026-03-05T10:00:00.000Z',
      }),
      createMockSystem({
        display_name: 'gamma',
        hits: 2,
        last_seen: '2026-03-03T10:00:00.000Z',
      }),
    ];

    it('sorts by display_name ascending', () => {
      const sorted = sortSystems(systems, 'display_name');
      expect(sorted[0].display_name).toBe('alpha');
      expect(sorted[2].display_name).toBe('gamma');
    });

    it('sorts by display_name descending', () => {
      const sorted = sortSystems(systems, '-display_name');
      expect(sorted[0].display_name).toBe('gamma');
      expect(sorted[2].display_name).toBe('alpha');
    });

    it('sorts by hits ascending', () => {
      const sorted = sortSystems(systems, 'hits');
      expect(sorted[0].hits).toBe(2);
      expect(sorted[2].hits).toBe(10);
    });

    it('sorts by hits descending', () => {
      const sorted = sortSystems(systems, '-hits');
      expect(sorted[0].hits).toBe(10);
      expect(sorted[2].hits).toBe(2);
    });

    it('sorts by last_seen date', () => {
      const sorted = sortSystems(systems, '-last_seen');
      expect(sorted[0].last_seen).toBe('2026-03-05T10:00:00.000Z');
      expect(sorted[2].last_seen).toBe('2026-03-01T10:00:00.000Z');
    });

    it('returns original array when no sort param', () => {
      const sorted = sortSystems(systems, null);
      expect(sorted).toEqual(systems);
    });
  });

  describe('paginateSystems', () => {
    const systems = createMockSystems(50);

    it('returns first page', () => {
      const page1 = paginateSystems(systems, 20, 0);
      expect(page1).toHaveLength(20);
      expect(page1[0]).toEqual(systems[0]);
    });

    it('returns second page', () => {
      const page2 = paginateSystems(systems, 20, 20);
      expect(page2).toHaveLength(20);
      expect(page2[0]).toEqual(systems[20]);
    });

    it('returns partial last page', () => {
      const page3 = paginateSystems(systems, 20, 40);
      expect(page3).toHaveLength(10);
    });
  });

  describe('mockSystemsApiHandler', () => {
    it('handles complete query with all parameters', () => {
      const response = mockSystemsApiHandler({
        limit: 10,
        offset: 0,
        sort: '-hits',
        hits: ['4'],
        incident: 'true',
      });

      expect(response.data).toBeDefined();
      expect(response.data.length).toBeLessThanOrEqual(10);
      expect(response.meta.count).toBeDefined();
    });

    it('respects limit parameter', () => {
      const response = mockSystemsApiHandler({ limit: 5 });
      expect(response.data.length).toBeLessThanOrEqual(5);
    });

    it('respects offset parameter', () => {
      const response1 = mockSystemsApiHandler({ limit: 10, offset: 0 });
      const response2 = mockSystemsApiHandler({ limit: 10, offset: 10 });

      expect(response1.data).not.toEqual(response2.data);
    });
  });

  describe('mockScenarios', () => {
    it('allSystems returns full dataset', () => {
      const response = mockScenarios.allSystems();
      expect(response.data.length).toBe(20);
      expect(response.meta.count).toBe(100);
    });

    it('criticalOnly returns critical systems', () => {
      const response = mockScenarios.criticalOnly();
      response.data.forEach((system) => {
        expect(system.critical_hits).toBeGreaterThan(0);
      });
    });

    it('lowRiskOnly returns low risk systems', () => {
      const response = mockScenarios.lowRiskOnly();
      response.data.forEach((system) => {
        expect(system.critical_hits).toBe(0);
        expect(system.important_hits).toBe(0);
        expect(system.moderate_hits).toBe(0);
        expect(system.low_hits).toBeGreaterThan(0);
      });
    });

    it('cleanSystems returns systems with no hits', () => {
      const response = mockScenarios.cleanSystems();
      response.data.forEach((system) => {
        expect(system.hits).toBe(0);
        expect(system.critical_hits).toBe(0);
        expect(system.important_hits).toBe(0);
        expect(system.moderate_hits).toBe(0);
        expect(system.low_hits).toBe(0);
      });
    });

    it('incidentSystems returns incident systems', () => {
      const response = mockScenarios.incidentSystems();
      response.data.forEach((system) => {
        expect(system.incident_hits).toBeGreaterThan(0);
      });
    });

    it('noMatches returns empty result', () => {
      const response = mockScenarios.noMatches();
      expect(response.data).toHaveLength(0);
      expect(response.meta.count).toBe(0);
    });

    it('largeDataset returns large dataset', () => {
      const response = mockScenarios.largeDataset();
      expect(response.meta.count).toBe(500);
    });
  });
});
