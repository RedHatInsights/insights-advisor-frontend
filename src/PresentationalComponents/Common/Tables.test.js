import { pruneFilters, urlBuilder, workloadArrayQueryBuilder } from './Tables';

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
        chips: [{ name: 'RHEL 9.7', value: '9.7' }],
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

  it('returns empty array for empty filters', () => {
    const result = pruneFilters({}, SFC);
    expect(result).toEqual([]);
  });

  it('creates Name chip for name string filter', () => {
    const filters = { name: '9c95-731d' };
    const result = pruneFilters(filters, SFC);

    expect(result).toEqual([
      {
        category: 'Name',
        chips: [{ name: '9c95-731d', value: '9c95-731d' }],
        urlParam: 'name',
      },
    ]);
  });

  it('creates Name chip for display_name string filter', () => {
    const filters = { display_name: 'test-host' };
    const result = pruneFilters(filters, SFC);

    expect(result).toEqual([
      {
        category: 'Name',
        chips: [{ name: 'test-host', value: 'test-host' }],
        urlParam: 'display_name',
      },
    ]);
  });

  it('creates Name chip for text string filter', () => {
    const filters = { text: 'kernel' };
    const result = pruneFilters(filters, SFC);

    expect(result).toEqual([
      {
        category: 'Name',
        chips: [{ name: 'kernel', value: 'kernel' }],
        urlParam: 'text',
      },
    ]);
  });

  it('creates Name chip for text array filter (from paramParser)', () => {
    const filters = { text: ['kernel'] };
    const result = pruneFilters(filters, SFC);

    expect(result).toEqual([
      {
        category: 'Name',
        chips: [{ name: 'kernel', value: 'kernel' }],
        urlParam: 'text',
      },
    ]);
  });

  it('skips whitespace-only and empty search values', () => {
    const filters = { name: '   ', text: '', display_name: null };
    const result = pruneFilters(filters, SFC);

    expect(result).toEqual([]);
  });
});

describe('resolveChipLabel', () => {
  const { resolveChipLabel } = require('./Tables');

  it('prefixes rhel_version values with RHEL', () => {
    expect(resolveChipLabel('rhel_version', '9.4')).toBe('RHEL 9.4');
  });

  it('finds matching label in category values', () => {
    const category = { values: [{ value: '4', label: 'Critical' }] };
    expect(resolveChipLabel('hits', '4', category)).toBe('Critical');
  });

  it('finds matching text in category values if label is not present', () => {
    const category = { values: [{ value: '4', text: 'Critical Risk' }] };
    expect(resolveChipLabel('hits', '4', category)).toBe('Critical Risk');
  });

  it('falls back to string value if not matched in category values', () => {
    const category = { values: [{ value: '1', label: 'Low' }] };
    expect(resolveChipLabel('hits', '99', category)).toBe('99');
  });
});

describe('toCategoryChip', () => {
  const { toCategoryChip } = require('./Tables');

  it('creates category chip descriptor for array of values', () => {
    const category = {
      title: 'total risk',
      urlParam: 'hits',
      values: [{ value: '4', label: 'Critical' }],
    };
    expect(toCategoryChip('hits', ['4'], category)).toEqual({
      category: 'Total risk',
      urlParam: 'hits',
      chips: [{ name: 'Critical', value: '4' }],
    });
  });

  it('creates category chip descriptor for single scalar value', () => {
    const category = {
      title: 'operating system',
      urlParam: 'rhel_version',
    };
    expect(toCategoryChip('rhel_version', '9.2', category)).toEqual({
      category: 'Operating system',
      urlParam: 'rhel_version',
      chips: [{ name: 'RHEL 9.2', value: '9.2' }],
    });
  });
});

describe('toSearchChip', () => {
  const { toSearchChip } = require('./Tables');

  it('creates search chip with Name category and provided urlParam', () => {
    expect(toSearchChip('display_name', 'host-01')).toEqual({
      category: 'Name',
      urlParam: 'display_name',
      chips: [{ name: 'host-01', value: 'host-01' }],
    });
  });
});

describe('urlBuilder', () => {
  let replaceStateSpy;

  beforeEach(() => {
    replaceStateSpy = jest
      .spyOn(window.history, 'replaceState')
      .mockImplementation(() => {});
  });

  afterEach(() => {
    replaceStateSpy.mockRestore();
  });

  it('includes selectedTags passed as second argument into URL search params', () => {
    const filters = { limit: 20, offset: 0 };
    const selectedTags = ['env/prod=true', 'namespace/app=advisor'];

    urlBuilder(filters, selectedTags);

    expect(replaceStateSpy).toHaveBeenCalledWith(
      null,
      null,
      expect.stringContaining(
        'tags=env%2Fprod%3Dtrue%2Cnamespace%2Fapp%3Dadvisor',
      ),
    );
  });
});
