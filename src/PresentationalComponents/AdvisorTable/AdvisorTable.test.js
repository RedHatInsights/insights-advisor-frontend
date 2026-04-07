import React from 'react';
import { render } from '@testing-library/react';
import AdvisorTable from './AdvisorTable';
import {
  paginationSerialiser,
  sortSerialiser,
  filtersSerialiser,
} from '../../Utilities/tableSerializers';

// Mock bastilian-tabletools to avoid PatternFly/JSDOM CSS issues
jest.mock('bastilian-tabletools', () => ({
  TableToolsTable: jest.fn(() => <div data-testid="table-tools-table" />),
}));

describe('AdvisorTable', () => {
  const { TableToolsTable } = require('bastilian-tabletools');

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('passes serializers to TableToolsTable', () => {
    render(<AdvisorTable items={[]} columns={[]} total={0} />);

    expect(TableToolsTable).toHaveBeenCalledWith(
      expect.objectContaining({
        items: [],
        columns: [],
        total: 0,
        options: expect.objectContaining({
          serialisers: {
            pagination: paginationSerialiser,
            sort: sortSerialiser,
            filters: filtersSerialiser,
          },
        }),
      }),
      expect.anything(),
    );
  });

  it('merges custom options with serializers', () => {
    const customOptions = {
      pagination: true,
      exportable: { columns: [] },
    };

    render(
      <AdvisorTable
        items={[]}
        columns={[]}
        total={0}
        options={customOptions}
      />,
    );

    expect(TableToolsTable).toHaveBeenCalledWith(
      expect.objectContaining({
        options: expect.objectContaining({
          pagination: true,
          exportable: { columns: [] },
          serialisers: {
            pagination: paginationSerialiser,
            sort: sortSerialiser,
            filters: filtersSerialiser,
          },
        }),
      }),
      expect.anything(),
    );
  });

  it('passes through all other props', () => {
    render(
      <AdvisorTable
        items={[{ id: 1 }]}
        columns={[{ title: 'Test' }]}
        total={1}
        loading={false}
        filters={{ filterConfig: [] }}
      />,
    );

    expect(TableToolsTable).toHaveBeenCalledWith(
      expect.objectContaining({
        items: [{ id: 1 }],
        columns: [{ title: 'Test' }],
        total: 1,
        loading: false,
        filters: { filterConfig: [] },
      }),
      expect.anything(),
    );
  });

  it('deep merges custom serializers without wiping defaults', () => {
    const customPaginationSerializer = jest.fn();

    render(
      <AdvisorTable
        items={[]}
        columns={[]}
        total={0}
        options={{
          serialisers: {
            pagination: customPaginationSerializer,
          },
        }}
      />,
    );

    expect(TableToolsTable).toHaveBeenCalledWith(
      expect.objectContaining({
        options: expect.objectContaining({
          serialisers: {
            pagination: customPaginationSerializer,
            sort: sortSerialiser,
            filters: filtersSerialiser,
          },
        }),
      }),
      expect.anything(),
    );
  });
});
