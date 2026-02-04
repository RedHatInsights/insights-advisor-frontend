import React from 'react';
import '@testing-library/jest-dom';
import { ComponentWithContext } from '../../Utilities/TestingUtilities';
import SystemsTable from './SystemsTable';
import { render, waitFor } from '@testing-library/react';
import { InventoryTable } from '@redhat-cloud-services/frontend-components/Inventory';
import { Get } from '../../Utilities/Api';
import { useAddNotification } from '@redhat-cloud-services/frontend-components-notifications/';
import { NO_SYSTEMS_REASONS } from '../../AppConstants';

jest.mock('@redhat-cloud-services/frontend-components/Inventory', () => ({
  __esModule: true,
  InventoryTable: jest.fn((props) => (
    <div {...props} aria-label="immutableDevices-module-mock">
      InventoryTable
    </div>
  )),
}));

jest.mock('../Export/SystemsPdf', () => ({
  __esModule: true,
  default: jest.fn((props) => (
    <div {...props} aria-label="systems-pdf-mock">
      SystemsPdf
    </div>
  )),
}));

jest.mock('@unleash/proxy-client-react', () => ({
  ...jest.requireActual('@unleash/proxy-client-react'),
  useFlag: () => true,
  useFlagsStatus: () => ({ flagsReady: true }),
}));

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: jest.fn(() => ({ sysState: { page: 1, sort: '-last_seen' } })),
}));

jest.mock('../../Utilities/Api', () => ({
  ...jest.requireActual('../../Utilities/Api'),
  Get: jest.fn(),
}));

jest.mock('@redhat-cloud-services/frontend-components-notifications/', () => ({
  ...jest.requireActual(
    '@redhat-cloud-services/frontend-components-notifications/',
  ),
  useAddNotification: jest.fn(),
}));

describe('Systems', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAddNotification.mockReturnValue(jest.fn());
  });

  it('Should always show conventional systems by filtering host_type', () => {
    render(<ComponentWithContext Component={SystemsTable} />);

    expect(InventoryTable).toHaveBeenCalledWith(
      expect.objectContaining({
        customFilters: expect.objectContaining({
          advisorFilters: {
            'filter[system_profile]': true,
            sysState: { page: 1, sort: '-last_seen' },
          },
        }),
      }),
      {},
    );
  });

  it('handles 400 errors by notifying and returning empty results', async () => {
    const addNotification = jest.fn();
    useAddNotification.mockReturnValue(addNotification);

    Get.mockRejectedValue({
      response: {
        status: 400,
        data: { message: 'Bad request from API' },
      },
      message: 'Request failed with status code 400',
    });

    render(<ComponentWithContext Component={SystemsTable} />);

    const inventoryTableProps = InventoryTable.mock.calls[0][0];
    const result = await inventoryTableProps.getEntities(
      [],
      {
        per_page: 20,
        page: 1,
        orderBy: 'display_name',
        orderDirection: 'asc',
        advisorFilters: {},
        filters: {},
        workloads: [],
      },
      true,
      jest.fn(),
    );

    expect(result).toEqual({ results: [], total: 0 });
    expect(addNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        variant: 'danger',
        title: 'There was an error fetching systems',
        description: 'Bad request from API',
      }),
    );

    await waitFor(() => {
      const latestInventoryProps =
        InventoryTable.mock.calls[InventoryTable.mock.calls.length - 1][0];
      expect(latestInventoryProps.noSystemsTable.props.reason).toBe(
        NO_SYSTEMS_REASONS.ERROR,
      );
    });
  });

  it('rethrows non-400 errors from systems fetch', async () => {
    const error = new Error('Network unavailable');
    Get.mockRejectedValue(error);

    render(<ComponentWithContext Component={SystemsTable} />);
    const inventoryTableProps = InventoryTable.mock.calls[0][0];

    await expect(
      inventoryTableProps.getEntities(
        [],
        {
          per_page: 20,
          page: 1,
          orderBy: 'display_name',
          orderDirection: 'asc',
          advisorFilters: {},
          filters: {},
          workloads: [],
        },
        true,
        jest.fn(),
      ),
    ).rejects.toThrow('Network unavailable');
  });
});
