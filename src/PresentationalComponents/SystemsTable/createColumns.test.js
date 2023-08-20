import { createColumns } from './createColumns';

describe('createColumns', () => {
  it('removes "groups" column if missing from defaultColumns', () => {
    const defaultColumns = [
      { key: 'tags', label: 'Tags' },
      { key: 'other', label: 'Other' },
    ];

    const columns = [
      { key: 'groups', label: 'Groups', requiresDefault: true },
      { key: 'tags', label: 'Tags' },
    ];

    const mappedColumns = createColumns(defaultColumns, columns);

    expect(mappedColumns).toHaveLength(1); // Expecting 1 mapped column
    expect(mappedColumns[0]).toEqual(columns[1]); // Expecting the first column to match the original column
  });

  it('test requiresDefault parameter, 1', () => {
    const defaultColumns = [
      { key: 'groups', label: 'Groups' },
      { key: 'tags', label: 'Tags' },
      { key: 'other', label: 'Other' },
    ];

    const columns = [
      { key: 'groups', label: 'Groups', requiresDefault: true },
      { key: 'tags', label: 'Tags' },
      { key: 'other', label: 'Other' },
    ];

    const mappedColumns = createColumns(defaultColumns, columns);

    expect(mappedColumns).toHaveLength(3); // expecting 3 mapped columns
    expect(mappedColumns.map(({ key }) => key)).toEqual(
      columns.map(({ key }) => key)
    );
  });

  it('test requiresDefault parameter, 2', () => {
    const defaultColumns = [
      { key: 'tags', label: 'Tags' },
      { key: 'other', label: 'Other' },
    ];

    const columns = [
      { key: 'groups', label: 'Groups', requiresDefault: true },
      { key: 'tags', label: 'Tags' },
      { key: 'other', label: 'Other' },
    ];

    const mappedColumns = createColumns(defaultColumns, columns);

    expect(mappedColumns).toHaveLength(2); // expecting 2 mapped columns
    expect(mappedColumns.map(({ key }) => key)).toEqual(
      columns.map(({ key }) => key).slice(1, 3)
    );
  });
});
