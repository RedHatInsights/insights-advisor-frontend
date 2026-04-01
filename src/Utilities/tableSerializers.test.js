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
    { id: 'text', type: 'text', urlParam: 'text' },
    { id: 'total_risk', type: 'checkbox', urlParam: 'total_risk' },
    { id: 'category', type: 'radio', urlParam: 'category' },
  ];

  it('handles text filter', () => {
    const result = filtersSerialiser({ text: 'security' }, filterConfig);
    expect(result).toEqual({ text: 'security' });
  });

  it('handles checkbox filter with array', () => {
    const result = filtersSerialiser(
      { total_risk: ['1', '2', '3'] },
      filterConfig,
    );
    expect(result).toEqual({ total_risk: '1,2,3' });
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
      total_risk: '1,2',
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
    expect(result).toEqual({ total_risk: 'single' });
  });

  it('handles empty array for checkbox filter', () => {
    const result = filtersSerialiser({ total_risk: [] }, filterConfig);
    expect(result).toEqual({ total_risk: '' });
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
      { id: 'custom', type: 'custom-type', urlParam: 'custom' },
    ];
    const result = filtersSerialiser({ custom: 'value' }, customConfig);
    expect(result).toEqual({ custom: 'value' });
  });
});
