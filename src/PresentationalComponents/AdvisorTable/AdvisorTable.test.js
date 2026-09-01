import React from 'react';
import { render } from '@testing-library/react';
import AdvisorTable from './AdvisorTable';
import {
  paginationSerialiser,
  sortSerialiser,
  filtersSerialiser,
} from '../../Utilities/tableSerializers';
import { useFeatureFlag } from '../../Utilities/Hooks';

// Mock bastilian-tabletools to avoid PatternFly/JSDOM CSS issues
jest.mock('bastilian-tabletools', () => ({
  BaseTableToolsTable: jest.fn(() => (
    <div data-testid="base-table-tools-table" />
  )),
}));

jest.mock('../../Utilities/Hooks', () => ({
  ...jest.requireActual('../../Utilities/Hooks'),
  useFeatureFlag: jest.fn(() => false),
}));

describe('AdvisorTable', () => {
  const { BaseTableToolsTable } = require('bastilian-tabletools');

  beforeEach(() => {
    jest.clearAllMocks();
    useFeatureFlag.mockReturnValue(false);
  });

  it('passes props and advisor defaults to BaseTableToolsTable', () => {
    const props = {
      items: [{ id: 1 }],
      columns: [{ title: 'Test' }],
      total: 1,
      loading: false,
    };
    render(<AdvisorTable {...props} />);

    expect(BaseTableToolsTable).toHaveBeenCalledWith(
      expect.objectContaining({
        props: expect.objectContaining(props),
        defaults: expect.objectContaining({
          options: expect.objectContaining({
            debug: false,
            variant: 'compact',
            isStickyHeader: true,
            perPage: 20,
            serialisers: {
              pagination: paginationSerialiser,
              sort: sortSerialiser,
              filters: filtersSerialiser,
            },
          }),
        }),
      }),
      expect.anything(),
    );
  });

  it('enables debug option when advisor.debug feature flag is active', () => {
    useFeatureFlag.mockReturnValue(true);
    render(<AdvisorTable items={[]} columns={[]} total={0} />);

    expect(BaseTableToolsTable).toHaveBeenCalledWith(
      expect.objectContaining({
        defaults: expect.objectContaining({
          options: expect.objectContaining({
            debug: true,
          }),
        }),
      }),
      expect.anything(),
    );
  });
});
