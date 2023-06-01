import { createColumns } from './createColumns';

describe('createColumns', () => {
  it('removes "groups" column if missing from defaultColumns', () => {
    const defaultColumns = [
      { key: 'tags', label: 'Tags' },
      { key: 'other', label: 'Other' },
    ];

    const columns = [
      { key: 'groups', label: 'Groups' },
      { key: 'tags', label: 'Tags' },
    ];

    const mappedColumns = createColumns(defaultColumns, columns);

    expect(mappedColumns).to.have.length(1); // Expecting 1 mapped column
    expect(mappedColumns[0]).to.deep.equal(columns[1]); // Expecting the first column to match the original column
  });

  it('keeps all columns if "groups" column is present in defaultColumns', () => {
    const defaultColumns = [
      { key: 'groups', label: 'Groups' },
      { key: 'tags', label: 'Tags' },
      { key: 'other', label: 'Other' },
    ];

    const columns = [
      { key: 'groups', label: 'Groups' },
      { key: 'tags', label: 'Tags' },
      { key: 'other', label: 'Other' },
    ];

    const mappedColumns = createColumns(defaultColumns, columns);

    expect(mappedColumns).to.have.length(3); // Expecting 3 mapped columns
    expect(mappedColumns[0]).to.deep.equal(columns[0]); // Expecting the first column to match the original column
    expect(mappedColumns[1]).to.deep.equal(columns[1]); // Expecting the second column to match the original column
    expect(mappedColumns[2]).to.deep.equal(defaultColumns[2]); // Expecting the third column to match the third column from defaultColumns
  });
});
