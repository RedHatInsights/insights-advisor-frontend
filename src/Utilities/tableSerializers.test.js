import {
  paginationSerialiser,
  sortSerialiser,
  filtersSerialiser,
} from './tableSerializers';

describe('paginationSerialiser', () => {
  it('converts page 1 correctly', () => {
    expect(paginationSerialiser({ page: 1, perPage: 20 })).toEqual({
      offset: 0,
      limit: 20,
    });
  });

  it('converts page 3 correctly', () => {
    expect(paginationSerialiser({ page: 3, perPage: 20 })).toEqual({
      offset: 40,
      limit: 20,
    });
  });

  it('handles different perPage values', () => {
    expect(paginationSerialiser({ page: 2, perPage: 50 })).toEqual({
      offset: 50,
      limit: 50,
    });
  });

  it('returns empty object for undefined input', () => {
    expect(paginationSerialiser()).toEqual({});
  });

  it('returns empty object for missing page', () => {
    expect(paginationSerialiser({ perPage: 20 })).toEqual({});
  });

  it('returns empty object for missing perPage', () => {
    expect(paginationSerialiser({ page: 1 })).toEqual({});
  });

  it('handles page 1 with 10 items per page', () => {
    expect(paginationSerialiser({ page: 1, perPage: 10 })).toEqual({
      offset: 0,
      limit: 10,
    });
  });

  it('handles large page numbers', () => {
    expect(paginationSerialiser({ page: 100, perPage: 20 })).toEqual({
      offset: 1980,
      limit: 20,
    });
  });
});

describe('sortSerialiser', () => {
  const columns = [
    { title: 'Description', sortable: 'description' },
    { title: 'Total Risk', sortable: 'total_risk' },
    { title: 'Publish Date', sortable: 'publish_date' },
  ];

  it('handles ascending sort', () => {
    expect(sortSerialiser({ index: 0, direction: 'asc' }, columns)).toBe(
      'description',
    );
  });

  it('handles descending sort', () => {
    expect(sortSerialiser({ index: 1, direction: 'desc' }, columns)).toBe(
      '-total_risk',
    );
  });

  it('returns undefined for non-existent index', () => {
    expect(
      sortSerialiser({ index: 99, direction: 'asc' }, columns),
    ).toBeUndefined();
  });

  it('returns undefined for invalid index', () => {
    expect(
      sortSerialiser({ index: 999, direction: 'asc' }, columns),
    ).toBeUndefined();
  });

  it('returns undefined for negative index', () => {
    expect(
      sortSerialiser({ index: -1, direction: 'asc' }, columns),
    ).toBeUndefined();
  });

  it('returns undefined for undefined input', () => {
    expect(sortSerialiser(undefined, columns)).toBeUndefined();
  });

  it('returns undefined for empty columns', () => {
    expect(sortSerialiser({ index: 0, direction: 'asc' }, [])).toBeUndefined();
  });

  it('handles ascending sort for second column', () => {
    expect(sortSerialiser({ index: 1, direction: 'asc' }, columns)).toBe(
      'total_risk',
    );
  });

  it('handles ascending sort for third column', () => {
    expect(sortSerialiser({ index: 2, direction: 'asc' }, columns)).toBe(
      'publish_date',
    );
  });

  it('handles descending sort for third column', () => {
    expect(sortSerialiser({ index: 2, direction: 'desc' }, columns)).toBe(
      '-publish_date',
    );
  });

  it('returns undefined for non-sortable column', () => {
    const columnsWithNonSortable = [
      { title: 'Description', sortable: 'description' },
      { title: 'Actions' }, // No sortable property
    ];
    expect(
      sortSerialiser({ index: 1, direction: 'asc' }, columnsWithNonSortable),
    ).toBeUndefined();
  });
});

describe('filtersSerialiser', () => {
  const filterConfig = [
    { id: 'text', type: 'text', filterAttribute: 'text' },
    { id: 'total_risk', type: 'checkbox', filterAttribute: 'total_risk' },
    { id: 'category', type: 'radio', filterAttribute: 'category' },
  ];

  it('handles text filter', () => {
    const result = filtersSerialiser({ text: 'security' }, filterConfig);
    expect(result).toEqual({ text: 'security' });
  });

  it('handles text filter with array by extracting first element', () => {
    const result = filtersSerialiser(
      { text: ['security', 'other'] },
      filterConfig,
    );
    expect(result).toEqual({ text: 'security' });
  });

  it('handles checkbox filter with array', () => {
    const result = filtersSerialiser(
      { total_risk: ['1', '2', '3'] },
      filterConfig,
    );
    expect(result).toEqual({ total_risk: ['1', '2', '3'] });
  });

  it('handles radio filter', () => {
    const result = filtersSerialiser({ category: ['security'] }, filterConfig);
    expect(result).toEqual({ category: 'security' });
  });

  it('handles multiple filters', () => {
    const result = filtersSerialiser(
      {
        text: 'test',
        total_risk: ['1', '2'],
        category: ['security'],
      },
      filterConfig,
    );
    expect(result).toEqual({
      text: 'test',
      total_risk: ['1', '2'],
      category: 'security',
    });
  });

  it('ignores unknown filters', () => {
    const result = filtersSerialiser({ unknown_filter: 'value' }, filterConfig);
    expect(result).toEqual({});
  });

  it('handles empty state', () => {
    const result = filtersSerialiser({}, filterConfig);
    expect(result).toEqual({});
  });

  it('handles undefined state', () => {
    const result = filtersSerialiser(undefined, filterConfig);
    expect(result).toEqual({});
  });

  it('handles null state', () => {
    const result = filtersSerialiser(null, filterConfig);
    expect(result).toEqual({});
  });

  it('handles checkbox filter with non-array value', () => {
    const result = filtersSerialiser({ total_risk: 'single' }, filterConfig);
    expect(result).toEqual({ total_risk: ['single'] });
  });

  it('handles empty array for checkbox filter', () => {
    const result = filtersSerialiser({ total_risk: [] }, filterConfig);
    expect(result).toEqual({ total_risk: [] });
  });

  it('normalizes kebab-case filter IDs to snake_case', () => {
    const kebabConfig = [
      { id: 'total-risk', type: 'checkbox', filterAttribute: 'total_risk' },
    ];
    const result = filtersSerialiser({ 'total-risk': ['1', '2'] }, kebabConfig);
    expect(result).toEqual({ total_risk: ['1', '2'] });
  });

  it('handles radio filter with non-array value', () => {
    const result = filtersSerialiser({ category: 'security' }, filterConfig);
    expect(result).toEqual({ category: 'security' });
  });

  it('handles empty filter config', () => {
    const result = filtersSerialiser({ text: 'test' }, []);
    expect(result).toEqual({});
  });

  it('handles filter with default type', () => {
    const customConfig = [
      { id: 'custom', type: 'custom-type', filterAttribute: 'custom' },
    ];
    const result = filtersSerialiser({ custom: 'value' }, customConfig);
    expect(result).toEqual({ custom: 'value' });
  });

  describe('custom filterSerialiser functions', () => {
    it('uses per-filter filterSerialiser when provided', () => {
      const customSerialiser = jest.fn(() => ({ custom: 'value' }));
      const configWithCustom = [
        {
          id: 'has_incident',
          filterAttribute: 'has_incident',
          filterSerialiser: customSerialiser,
        },
      ];

      filtersSerialiser({ has_incident: ['true'] }, configWithCustom);

      expect(customSerialiser).toHaveBeenCalledWith(
        ['true'],
        expect.objectContaining({ id: 'has_incident' }),
        {},
      );
    });

    it('merges results from multiple custom serializers', () => {
      const configWithMultipleCustom = [
        {
          id: 'has_incident',
          filterSerialiser: () => ({ hasIncident: 'true' }),
        },
        {
          id: 'category',
          filterSerialiser: () => ({ category: ['1', '2'] }),
        },
      ];

      const result = filtersSerialiser(
        { has_incident: ['true'], category: ['1', '2'] },
        configWithMultipleCustom,
      );

      expect(result).toEqual({
        hasIncident: 'true',
        category: ['1', '2'],
      });
    });

    it('converts snake_case to camelCase for insights-client (hasIncident)', () => {
      const incidentConfig = [
        {
          id: 'has_incident',
          filterAttribute: 'has_incident',
          filterSerialiser: (value) => {
            const incidents = Array.isArray(value) ? value : [];
            return incidents.length > 0 ? { hasIncident: incidents[0] } : {};
          },
        },
      ];

      const result = filtersSerialiser(
        { 'has-incident': ['true'] },
        incidentConfig,
      );

      expect(result).toHaveProperty('hasIncident');
      expect(result).not.toHaveProperty('has_incident');
      expect(result.hasIncident).toBe('true');
    });

    it('converts snake_case to camelCase for insights-client (rebootRequired)', () => {
      const rebootConfig = [
        {
          id: 'reboot_required',
          filterAttribute: 'reboot_required',
          filterSerialiser: (value) => {
            const reboots = Array.isArray(value) ? value : [];
            return reboots.length > 0 ? { rebootRequired: reboots[0] } : {};
          },
        },
      ];

      const result = filtersSerialiser(
        { 'reboot-required': ['false'] },
        rebootConfig,
      );

      expect(result).toHaveProperty('rebootRequired');
      expect(result).not.toHaveProperty('reboot_required');
      expect(result.rebootRequired).toBe('false');
    });

    it('handles custom serializer returning empty object', () => {
      const configWithEmptyReturn = [
        {
          id: 'has_incident',
          filterSerialiser: () => ({}),
        },
      ];

      const result = filtersSerialiser(
        { has_incident: [] },
        configWithEmptyReturn,
      );

      expect(result).toEqual({});
    });

    it('custom serializer receives correct parameters', () => {
      const serialiser = jest.fn(() => ({}));
      const config = [
        {
          id: 'test_filter',
          filterAttribute: 'test',
          filterSerialiser: serialiser,
        },
      ];

      filtersSerialiser({ test_filter: ['value1', 'value2'] }, config);

      expect(serialiser).toHaveBeenCalledWith(
        ['value1', 'value2'],
        expect.objectContaining({ id: 'test_filter' }),
        {},
      );
    });

    it('custom serializer can access accumulated params', () => {
      const config = [
        {
          id: 'filter1',
          filterSerialiser: () => ({ key1: 'value1' }),
        },
        {
          id: 'filter2',
          filterSerialiser: (value, filterConfig, params) => {
            // Can see params accumulated so far
            return { key2: 'value2', fromPrevious: params.key1 };
          },
        },
      ];

      const result = filtersSerialiser(
        { filter1: ['a'], filter2: ['b'] },
        config,
      );

      expect(result).toEqual({
        key1: 'value1',
        key2: 'value2',
        fromPrevious: 'value1',
      });
    });
  });
});
