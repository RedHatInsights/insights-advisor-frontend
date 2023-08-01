export const createColumns = (defaultColumns, columns) =>
  columns
    .map((column) => {
      const correspondingColumn = defaultColumns.find(
        (defaultColumn) => defaultColumn.key === column.key
      );

      return column.requiresDefault && correspondingColumn === undefined
        ? undefined
        : { ...column, ...correspondingColumn };
    })
    .filter(Boolean);
