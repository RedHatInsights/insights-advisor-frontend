export const createColumns = (defaultColumns, columns) => {
  const mappedColumns = columns.filter((column) => {
    if (column.key === 'groups') {
      const correspondingColumn = defaultColumns.find(
        (defaultColumn) => defaultColumn.key === column.key
      );
      return correspondingColumn;
    } else {
      return true;
    }
  });

  return mappedColumns.map((column) => {
    const correspondingColumn = defaultColumns.find(
      (defaultColumn) => defaultColumn.key === column.key
    );
    return correspondingColumn
      ? { ...column, ...correspondingColumn }
      : { ...column };
  });
};
