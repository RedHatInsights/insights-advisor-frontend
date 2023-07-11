import React from 'react';
import isEmpty from 'lodash/isEmpty';

export const createColumns = (defaultColumns, columns) =>
  columns
    .map((column) => {
      const correspondingColumn = defaultColumns.find(
        (defaultColumn) => defaultColumn.key === column.key
      );

      return column.requiresDefault && correspondingColumn === undefined
        ? undefined
        : {
            ...column,
            ...correspondingColumn,
            ...(column.key === 'groups'
              ? {
                  renderFunc: (groups) =>
                    isEmpty(groups) ? (
                      'N/A'
                    ) : (
                      /**
                       * TODO: change `a` to `Link` once https://issues.redhat.com/browse/ADVISOR-2955 is complete
                       */
                      <a href={`./insights/inventory/groups/${groups[0].id}`}>
                        {
                          groups[0].name // currently, one group at maximum is supported
                        }
                      </a>
                    ),
                }
              : {}),
          };
    })
    .filter(Boolean);
