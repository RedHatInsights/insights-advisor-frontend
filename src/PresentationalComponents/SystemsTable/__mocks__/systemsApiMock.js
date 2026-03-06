/**
 * Mock factory for Systems API responses
 * Based on: GET /api/insights/v1/system/
 */

export const createMockSystem = (overrides = {}) => ({
  all_pathway_hits: 0,
  critical_hits: 0,
  display_name: 'test-system.example.com',
  group_name: 'production',
  hits: 0,
  important_hits: 0,
  incident_hits: 0,
  last_seen: '2026-03-05T10:30:00.000Z',
  low_hits: 0,
  moderate_hits: 0,
  os_name: 'RHEL',
  pathway_filter_hits: 0,
  rhel_version: '8.9',
  stale_at: '2026-03-12T10:30:00.000Z',
  system_uuid: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  ...overrides,
});

export const createMockSystems = (count = 5, customizer = null) => {
  const systems = [];
  const riskLevels = [
    { critical: 2, important: 3, moderate: 1, low: 2, hits: 8 },
    { critical: 0, important: 4, moderate: 2, low: 1, hits: 7 },
    { critical: 0, important: 0, moderate: 5, low: 3, hits: 8 },
    { critical: 0, important: 0, moderate: 0, low: 4, hits: 4 },
    { critical: 0, important: 0, moderate: 0, low: 0, hits: 0 },
  ];

  const rhelVersions = ['7.9', '8.9', '8.10', '9.0', '9.2', '9.3'];
  const groupNames = ['production', 'staging', 'development', 'qa', null];

  for (let i = 0; i < count; i++) {
    const riskLevel = riskLevels[i % riskLevels.length];
    const hasIncident = i % 3 === 0;

    const system = createMockSystem({
      system_uuid: `${i}fa85f64-5717-4562-b3fc-2c963f66afa${i}`,
      display_name: `system-${i + 1}.example.com`,
      rhel_version: rhelVersions[i % rhelVersions.length],
      group_name: groupNames[i % groupNames.length],
      critical_hits: riskLevel.critical,
      important_hits: riskLevel.important,
      moderate_hits: riskLevel.moderate,
      low_hits: riskLevel.low,
      hits: riskLevel.hits,
      incident_hits: hasIncident ? 1 : 0,
      all_pathway_hits: Math.floor(Math.random() * 5),
      pathway_filter_hits: Math.floor(Math.random() * 3),
      last_seen: new Date(
        Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000,
      ).toISOString(),
      stale_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    });

    systems.push(customizer ? customizer(system, i) : system);
  }

  return systems;
};

export const createMockSystemsResponse = (options = {}) => {
  const {
    count = 5,
    total = 100,
    limit = 20,
    offset = 0,
    customizer = null,
    baseUrl = 'https://example.com/api/insights/v1/system',
  } = options;

  const systems = createMockSystems(count, customizer);
  const currentPage = Math.floor(offset / limit) + 1;
  const totalPages = Math.ceil(total / limit);

  return {
    data: systems,
    links: {
      first: `${baseUrl}?limit=${limit}&offset=0`,
      last: `${baseUrl}?limit=${limit}&offset=${(totalPages - 1) * limit}`,
      next:
        currentPage < totalPages
          ? `${baseUrl}?limit=${limit}&offset=${offset + limit}`
          : null,
      previous:
        offset > 0
          ? `${baseUrl}?limit=${limit}&offset=${Math.max(0, offset - limit)}`
          : null,
    },
    meta: {
      count: total,
    },
  };
};

export const getSystemMaxRisk = (system) => {
  if (system.critical_hits > 0) return 4;
  if (system.important_hits > 0) return 3;
  if (system.moderate_hits > 0) return 2;
  if (system.low_hits > 0) return 1;
  return 0;
};

export const filterSystems = (systems, queryParams) => {
  let filtered = [...systems];

  if (queryParams.display_name) {
    filtered = filtered.filter((sys) =>
      sys.display_name
        .toLowerCase()
        .includes(queryParams.display_name.toLowerCase()),
    );
  }

  if (queryParams.hits && queryParams.hits.length > 0) {
    if (!queryParams.hits.includes('all') && !queryParams.hits.includes('0')) {
      filtered = filtered.filter((sys) => {
        const maxRisk = getSystemMaxRisk(sys);
        return queryParams.hits.includes(String(maxRisk));
      });
    }
  }

  if (queryParams.incident !== undefined) {
    const wantsIncident =
      queryParams.incident === 'true' || queryParams.incident === true;
    filtered = filtered.filter((sys) =>
      wantsIncident ? sys.incident_hits > 0 : sys.incident_hits === 0,
    );
  }

  if (queryParams.rhel_version && queryParams.rhel_version.length > 0) {
    filtered = filtered.filter((sys) =>
      queryParams.rhel_version.includes(sys.rhel_version),
    );
  }

  if (queryParams.groups && queryParams.groups.length > 0) {
    filtered = filtered.filter((sys) =>
      queryParams.groups.includes(sys.group_name),
    );
  }

  return filtered;
};

export const sortSystems = (systems, sortParam) => {
  if (!sortParam) return systems;

  const descending = sortParam.startsWith('-');
  const field = descending ? sortParam.substring(1) : sortParam;

  return [...systems].sort((a, b) => {
    let aVal = a[field];
    let bVal = b[field];

    if (aVal === null || aVal === undefined) return 1;
    if (bVal === null || bVal === undefined) return -1;

    if (field === 'last_seen' || field === 'stale_at') {
      aVal = new Date(aVal).getTime();
      bVal = new Date(bVal).getTime();
    }

    if (typeof aVal === 'string') {
      aVal = aVal.toLowerCase();
      bVal = bVal.toLowerCase();
    }

    if (aVal < bVal) return descending ? 1 : -1;
    if (aVal > bVal) return descending ? -1 : 1;
    return 0;
  });
};

export const paginateSystems = (systems, limit = 20, offset = 0) => {
  return systems.slice(offset, offset + limit);
};

export const mockSystemsApiHandler = (queryParams = {}) => {
  const allSystems = createMockSystems(100);
  let filtered = filterSystems(allSystems, queryParams);
  const sorted = sortSystems(filtered, queryParams.sort);

  const limit = parseInt(queryParams.limit) || 20;
  const offset = parseInt(queryParams.offset) || 0;
  const paginated = paginateSystems(sorted, limit, offset);

  return createMockSystemsResponse({
    count: paginated.length,
    total: filtered.length,
    limit,
    offset,
    customizer: null,
  });
};

export const mockScenarios = {
  allSystems: () => createMockSystemsResponse({ count: 20, total: 100 }),

  criticalOnly: () =>
    createMockSystemsResponse({
      count: 5,
      total: 5,
      customizer: (sys) => {
        const critical = Math.ceil(Math.random() * 5);
        const important = Math.ceil(Math.random() * 3);
        const moderate = Math.ceil(Math.random() * 2);
        const low = Math.ceil(Math.random() * 2);
        return {
          ...sys,
          critical_hits: critical,
          important_hits: important,
          moderate_hits: moderate,
          low_hits: low,
          hits: critical + important + moderate + low,
        };
      },
    }),

  lowRiskOnly: () =>
    createMockSystemsResponse({
      count: 10,
      total: 10,
      customizer: (sys) => {
        const low = Math.ceil(Math.random() * 5);
        return {
          ...sys,
          critical_hits: 0,
          important_hits: 0,
          moderate_hits: 0,
          low_hits: low,
          hits: low,
        };
      },
    }),

  cleanSystems: () =>
    createMockSystemsResponse({
      count: 15,
      total: 15,
      customizer: (sys) => ({
        ...sys,
        critical_hits: 0,
        important_hits: 0,
        moderate_hits: 0,
        low_hits: 0,
        hits: 0,
        incident_hits: 0,
      }),
    }),

  incidentSystems: () =>
    createMockSystemsResponse({
      count: 8,
      total: 8,
      customizer: (sys) => ({
        ...sys,
        incident_hits: Math.ceil(Math.random() * 3),
      }),
    }),

  noMatches: () => createMockSystemsResponse({ count: 0, total: 0 }),

  largeDataset: () => createMockSystemsResponse({ count: 20, total: 500 }),
};

export default {
  createMockSystem,
  createMockSystems,
  createMockSystemsResponse,
  filterSystems,
  sortSystems,
  paginateSystems,
  getSystemMaxRisk,
  mockSystemsApiHandler,
  mockScenarios,
};
