import {
  pruneFilters,
  workloadArrayQueryBuilder,
  buildGlobalFilterParams,
} from './Tables';

jest.mock(
  '@redhat-cloud-services/frontend-components-utilities/helpers',
  () => ({
    generateFilter: jest.fn(),
    downloadFile: jest.fn(),
  }),
);

jest.mock('../../AppConstants', () => ({
  SYSTEM_FILTER_CATEGORIES: {
    rhel_version: {
      type: 'checkbox',
      title: 'Operating system',
      urlParam: 'rhel_version',
    },
    hits: {
      type: 'checkbox',
      title: 'total risk',
      urlParam: 'hits',
      values: [
        { label: 'All systems', text: 'All systems', value: 'all' },
        { label: 'Critical', value: '4' },
      ],
    },
  },
  SYSTEM_TYPES: { rhel: 1, ocp: 2 },
  FILTER_CATEGORIES: {},
  BASE_URL: '/api/advisor/v1',
}));

describe('workloadArrayQueryBuilder', () => {
  it('returns {} for an empty array', () => {
    expect(workloadArrayQueryBuilder([])).toEqual({});
  });

  it("returns { workload: ['sap'] } for a single-item array", () => {
    expect(workloadArrayQueryBuilder(['sap'])).toEqual({ workload: ['sap'] });
  });

  it('returns the full workload array for multiple values', () => {
    expect(workloadArrayQueryBuilder(['sap', 'ansible', 'mssql'])).toEqual({
      workload: ['sap', 'ansible', 'mssql'],
    });
  });

  it('returns {} when called with no argument (default parameter)', () => {
    expect(workloadArrayQueryBuilder()).toEqual({});
  });
});

describe('buildGlobalFilterParams', () => {
  it('returns {} when no filters are passed', () => {
    expect(buildGlobalFilterParams()).toEqual({});
  });

  it('formats selectedTags array into comma-separated tags string', () => {
    expect(
      buildGlobalFilterParams({ selectedTags: ['env=prod', 'app=db'] }),
    ).toEqual({
      tags: 'env=prod,app=db',
    });
  });

  it('formats selectedGroups array into comma-separated groups string', () => {
    expect(
      buildGlobalFilterParams({
        selectedGroups: ['Workspace 1', 'Workspace 2'],
      }),
    ).toEqual({
      groups: 'Workspace 1,Workspace 2',
    });
  });

  it('handles selectedGroups as a string', () => {
    expect(
      buildGlobalFilterParams({ selectedGroups: 'SingleWorkspace' }),
    ).toEqual({
      groups: 'SingleWorkspace',
    });
  });

  it('combines tags, groups, and workloads', () => {
    const {
      generateFilter,
    } = require('@redhat-cloud-services/frontend-components-utilities/helpers');
    generateFilter.mockReturnValueOnce({ 'workloads[SAP]': true });

    const result = buildGlobalFilterParams({
      selectedTags: ['tag1'],
      selectedGroups: ['group1'],
      workloads: { SAP: { isSelected: true } },
    });

    expect(result).toEqual({
      tags: 'tag1',
      groups: 'group1',
      'workloads[SAP]': true,
    });
  });
});

describe('pruneFilters', () => {
  const { SYSTEM_FILTER_CATEGORIES: SFC } = require('../../AppConstants');

  it('creates RHEL-prefixed chips for rhel_version array values', () => {
    const filters = { rhel_version: ['9.7', '9.4'] };
    const result = pruneFilters(filters, SFC);

    expect(result).toEqual([
      {
        category: 'Operating system',
        chips: [
          { name: 'RHEL 9.7', value: '9.7' },
          { name: 'RHEL 9.4', value: '9.4' },
        ],
        urlParam: 'rhel_version',
      },
    ]);
  });

  it('does not crash when rhel_version is a non-array value (no values property)', () => {
    const filters = { rhel_version: '9.7' };
    const result = pruneFilters(filters, SFC);

    expect(result).toEqual([
      {
        category: 'Operating system',
        chips: [{ name: '9.7', value: '9.7' }],
        urlParam: 'rhel_version',
      },
    ]);
  });

  it('uses category.values lookup for filters that have values defined', () => {
    const filters = { hits: ['4'] };
    const result = pruneFilters(filters, SFC);

    expect(result).toEqual([
      {
        category: 'Total risk',
        chips: [{ name: 'Critical', value: '4' }],
        urlParam: 'hits',
      },
    ]);
  });

  it('returns empty array when no filters match categories', () => {
    const filters = { unknown_filter: ['value'] };
    const result = pruneFilters(filters, SFC);

    expect(result).toEqual([]);
  });

  it('creates chips for groups filter with title Workspace', () => {
    const categories = {
      groups: {
        type: 'group',
        title: 'workspace',
        urlParam: 'groups',
      },
    };
    const filters = { groups: ['Production', 'Staging'] };
    const result = pruneFilters(filters, categories);

    expect(result).toEqual([
      {
        category: 'Workspace',
        chips: [
          { name: 'Production', value: 'Production' },
          { name: 'Staging', value: 'Staging' },
        ],
        urlParam: 'groups',
      },
    ]);
  });

  it('returns empty array for empty filters', () => {
    const result = pruneFilters({}, SFC);
    expect(result).toEqual([]);
  });
});
